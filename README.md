# Installation

```bash
$ npm install graphql-schema-cycles
```

# Usage

```ts
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
```

# Acknowledgements

Based on Jonas Lind and Kieron Soames's bachelor thesis titled "Detecting Cycles in GraphQL
Schemas". Available here: http://www.diva-portal.org/smash/get/diva2:1302887/FULLTEXT01.pdf.

Initial code was based on: https://github.com/LiUGraphQL/graphql-schema-cycles-webapp, by the same authors