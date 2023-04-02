# Visit JSON tree

### Abstract

This library aims to provide utility function to visit a JSON tree based on declared patterns.

## API

### visitJSONTree

Signature:

```typescript

declare async function visitJSONTree(
  tree: unknown,
  callback: (payload: {
    path: string[];
    value: JSONValue; // inferred from the match functions
    matchedPattern: string; // defaults to typeof LITERAL
  }) => Promise<void>,
  patterns: {
    name: string;
    match: (value: JSONValue) => Promise<{
      matched: JSONValue;
      isFinalMatch: boolean;
    }>;
  }[]
): Promise<void>
```

Example:

```typescript
import { visitJSONTree } from '@nclsndr/json-tree-visitor'

const acc: any[] = [];
await visitJSONTree(
  { a: 1, b: { c: "2" } },
  async (match) => {
    acc.push(match);
    match.value;
  },
  [
    {
      name: "is object with a",
      match: async (value) => {
        if (
          value === null ||
          typeof value !== "object" ||
          Array.isArray(value)
        ) {
          throw new Error("not an object");
        }
        if (!value.a) {
          throw new Error("not an object containing a");
        }
        return { matched: value, isFinalMatch: false };
      },
    },
    {
      name: "is number",
      match: async (value) => {
        if (typeof value !== "number") {
          throw new Error("not a number");
        }
        return { matched: value, isFinalMatch: true };
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
          throw new Error("not an object");
        }
        return { matched: value, isFinalMatch: true };
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