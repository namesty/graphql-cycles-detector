import { DocumentNode, print } from "graphql";
import { convert as convertSchemaToObj } from "@namestys/graphql-to-json";
import { convertToGraph } from "./graphify";
import { detectCycles } from './detectCycles';

interface Options {
  detectOnlyOne: boolean
}

export const getSchemaCycles = (schema: DocumentNode | string, options?: Partial<Options>) => {
  const parsedSchema = typeof schema !== "string" ? print(schema) : schema;
  const detectOne = options? !!options.detectOnlyOne: false;
  
  const object = convertSchemaToObj(parsedSchema);
  const { graph } = convertToGraph(object);

  const detectedCycles = detectCycles(graph, detectOne)

  const cycleStrings: string[] = detectedCycles.cycles.map((cycle: any) => {
    const cycleString = cycle.reduce((accumulator: string, vertice: any) => {
      accumulator += vertice["vertex"].vertexID;
      if( vertice["refLabel"] === "#interface_ref") {
        accumulator += " <~implements~ ";
      }
      else if (vertice["refLabel"] === "#union_ref") {
        accumulator += " -union-> ";
      }
      else accumulator += " -[" + vertice["refLabel"] + "]-> ";

      return accumulator
    }, "{ ")

    return cycleString.slice(0,-7) + " }"
  })

  return {
    jsObject: object,
    graph,
    cycles: detectedCycles.cycles,
    cycleStrings,
    foundCycle: detectedCycles.foundCycle
  }
};
