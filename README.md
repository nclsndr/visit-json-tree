# Visit JSON tree

Asynchronously visit a JSON tree based on pattern matching

### Abstract

This library aims to provide utility functions to visit a JSON tree based on declared patterns, leveraging the [async generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator) API.

> ⚠️ This is an experimental library – the API will likely change in the future.

## Usage

### Use cases

- **JSON tree traversal**: you can use this library to traverse a JSON tree. The library will visit the tree and call the callback for each match (or entry if no patterns provided). You can then use the callback to accumulate the match.

- **JSON tree transformation**: you can use this library to transform a JSON tree. The library will visit the tree and call the callback for each match. You can then use the callback to transform and accumulate the match.

- **JSON Schema validation**: you can use this library to validate a JSON tree against a JSON schema. The library will visit the tree and call the callback for each match. You can then use the callback to validate the match against the schema.

### Installation

via npm
```bash
npm install @nclsndr/visit-json-tree
```
via yarn
```bash
yarn add @nclsndr/visit-json-tree
```


## API

### visitJSONTree

Signature:

```typescript

async function visitJSONTree(
  tree: unknown,
  callback: (payload: {
    path: string[];
    value: JSONValue; // inferred from the match functions
    matchedPattern: string | Symbol; // defaults to typeof LITERAL
  }) => Promise<void>,
  patterns: {
    name: string;
    match: (value: JSONValue) => Promise<{
        hasMatched: true;
        payload: JSONValue;
        isFinalMatch: boolean;
      } | {
        hasMatched: false;
    }>;
  }[]
): Promise<void>
```

Example:

```typescript

const givenTree = { a: 1, b: { c: "2" } }
const acc: any[] = [];
await visitJSONTree(
  givenTree,
  async (match) => { // the callback is called for each match
    acc.push(match);
    match.value;
  },
  [ // the patterns are used to match against each structure of the tree
    {
      name: "is object with a",
      match: async (value) => {
        if (
          value === null ||
          typeof value !== "object" ||
          Array.isArray(value)
        ) {
          return { hasMatched: false };
        }
        if (!value.a) {
          return { hasMatched: false };
        }
        return { hasMatched: true, payload: value, isFinalMatch: false };
      },
    },
    {
      name: "is number",
      match: async (value) => {
        if (typeof value !== "number") {
          return { hasMatched: false };
        }
        return { hasMatched: true, payload: value, isFinalMatch: true };
      },
    },
    {
      name: "is object",
      match: async (value) => {
        if (
          value === null ||
          typeof value !== "object" ||
          Array.isArray(value)
        ) {
          return { hasMatched: false };
        }
        return { hasMatched: true, payload: value, isFinalMatch: true };
      },
    },
  ]
);

expect(acc[0]).toStrictEqual({
  path: [],
  value: { a: 1, b: { c: "2" } },
  matchedPattern: "is object with a",
});
expect(acc[1]).toStrictEqual({
  path: ["a"],
  value: 1,
  matchedPattern: "is number",
});
expect(acc[2]).toStrictEqual({
  path: ["b"],
  value: { c: "2" },
  matchedPattern: "is object",
});
expect(acc).toHaveLength(3);
```

### makeVisitTreeGenerator

signature:

```typescript
declare async function* makeVisitTreeGenerator(
  tree: JSONValue,
  patterns: Pattern[] | undefined,
  path: TreePath = []
): AsyncGenerator<{
  path: TreePath;
  matchedPattern: string | Symbol;
  value: Value;
}>
```
