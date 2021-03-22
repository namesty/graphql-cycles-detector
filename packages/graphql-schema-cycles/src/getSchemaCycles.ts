import { DocumentNode, print, visit, parse } from "graphql";
import { convert as convertSchemaToObj } from "graphql-json-transform";
import { convertToGraph } from "./graphify";
import { detectCycles } from './detectCycles';

interface Options {
  detectOnlyOne: boolean
  ignoreTypeNames: string[]
}

const DEFAULT_IGNORED_TYPENAMES = ["Mutation", "Subscription", "Query"];

const removeDirectives = (schemaString: string): string => {
  const schema = parse(schemaString);

  const newSchema = visit(schema, {
    Directive: () => {
      return null
    },
  })

  return print(newSchema)
}

export const getSchemaCycles = (schema: DocumentNode | string, options?: Partial<Options>) => {
  const parsedSchema = typeof schema !== "string" ? print(schema) : schema;
  const detectOne = options? !!options.detectOnlyOne: false;
  const typesToIgnore = options?.ignoreTypeNames || DEFAULT_IGNORED_TYPENAMES

  const schemaWithoutDirectives = removeDirectives(parsedSchema)
  const object = convertSchemaToObj(schemaWithoutDirectives);
  const { graph } = convertToGraph(object, typesToIgnore);

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
