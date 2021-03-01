import gql from "graphql-tag"
import { getSchemaCycles } from ".."

describe("Detect GraphQL Schema Cycles", () => {
  it("Detects a single direct cycle", () => {
    const schema = gql`
      type A {
        prop: B!
      }

      type B {
        prop: A!
      }
    `
    const { cycleStrings, cycles, foundCycle } = getSchemaCycles(schema);

    expect(cycleStrings.length).toEqual(1)
    expect(cycles.length).toEqual(1)
    expect(foundCycle).toEqual(true)
  })

  it("Returns false flag if no cycle found",() => {
    const schema = gql`
      type A {
        prop: B!
      }

      type B {
        prop: Boolean!
      }
    `
    const { cycleStrings, cycles, foundCycle } = getSchemaCycles(schema);

    expect(cycleStrings.length).toEqual(0)
    expect(cycles.length).toEqual(0)
    expect(foundCycle).toEqual(false)
  })

  it("Detects multiple cycles", () => {
    const schema = gql`
      type A {
        prop: B!
        root: C!
      }

      type B {
        prop: A!
      }
      
      type C {
        prop: A!
      }
    `
    const { cycleStrings, cycles, foundCycle } = getSchemaCycles(schema);

    expect(cycleStrings.length).toEqual(2)
    expect(cycles.length).toEqual(2)
    expect(foundCycle).toEqual(true)
  })

  it("Detects indirect cycles", () => {
    const schema = gql`
      type A {
        prop: B!
      }

      type B {
        prop: C!
      }
      
      type C {
        prop: A!
      }
    `
    const { cycleStrings, cycles, foundCycle } = getSchemaCycles(schema);

    expect(cycleStrings.length).toEqual(1)
    expect(cycles.length).toEqual(1)
    expect(foundCycle).toEqual(true)
  })

  it("Detects complex cycle combinations", () => {
    const schema = gql`
      type A {
        prop: B!
        root: D!
      }

      type B {
        prop: C!
      }
      
      type C {
        prop: A!
        root: D!
      }

      type D {
        prop: B!
        root: A!
      }
    `
    const { cycleStrings, cycles, foundCycle } = getSchemaCycles(schema);

    expect(cycleStrings.length).toEqual(5)
    expect(cycles.length).toEqual(5)
    expect(foundCycle).toEqual(true)
  })

  it("'Detect only one' flag works", () => {
    const schema = gql`
      type A {
        prop: B!
        root: D!
      }

      type B {
        prop: C!
      }
      
      type C {
        prop: A!
        root: D!
      }

      type D {
        prop: B!
        root: A!
      }
    `
    const { cycleStrings, cycles, foundCycle } = getSchemaCycles(schema, {
      detectOnlyOne: true
    });

    expect(cycleStrings.length).toEqual(0)
    expect(cycles.length).toEqual(0)
    expect(foundCycle).toEqual(true)
  })
})