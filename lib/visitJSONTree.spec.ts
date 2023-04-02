import { describe, it, expect } from "vitest";
import { LITERAL } from "./visit.js";

import { visitJSONTree } from "./visitJSONTree.js";

describe("visitJSONTree", () => {
  it("should visit a string", async () => {
    await visitJSONTree(
      "hello",
      async (match) => {
        expect(match).toStrictEqual({
          path: [],
          value: "hello",
          matchedPattern: LITERAL,
        });
      },
      []
    );
    expect.assertions(1);
  });
  it("should visit a number", async () => {
    await visitJSONTree(
      42,
      async (match) => {
        expect(match).toStrictEqual({
          path: [],
          value: 42,
          matchedPattern: LITERAL,
        });
      },
      []
    );
    expect.assertions(1);
  });
  it("should visit a boolean", async () => {
    await visitJSONTree(
      true,
      async (match) => {
        expect(match).toStrictEqual({
          path: [],
          value: true,
          matchedPattern: LITERAL,
        });
      },
      []
    );
    expect.assertions(1);
  });
  it("should visit a null", async () => {
    await visitJSONTree(
      null,
      async (match) => {
        expect(match).toStrictEqual({
          path: [],
          value: null,
          matchedPattern: LITERAL,
        });
      },
      []
    );
    expect.assertions(1);
  });
  it("should visit an array", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      [1, 2, 3],
      async (match) => {
        acc.push(match);
      },
      []
    );
    expect(acc[0]).toStrictEqual({
      path: [0],
      value: 1,
      matchedPattern: LITERAL,
    });
    expect(acc[1]).toStrictEqual({
      path: [1],
      value: 2,
      matchedPattern: LITERAL,
    });
    expect(acc[2]).toStrictEqual({
      path: [2],
      value: 3,
      matchedPattern: LITERAL,
    });
    expect(acc).toHaveLength(3);
  });
  it("should visit an object", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      { a: 1, b: 2, c: 3 },
      async (match) => {
        acc.push(match);
      },
      []
    );
    expect(acc[0]).toStrictEqual({
      path: ["a"],
      value: 1,
      matchedPattern: LITERAL,
    });
    expect(acc[1]).toStrictEqual({
      path: ["b"],
      value: 2,
      matchedPattern: LITERAL,
    });
    expect(acc[2]).toStrictEqual({
      path: ["c"],
      value: 3,
      matchedPattern: LITERAL,
    });
    expect(acc).toHaveLength(3);
  });
  it("should visit an object of array", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      { a: [1, 2] },
      async (match) => {
        acc.push(match);
      },
      []
    );
    expect(acc[0]).toStrictEqual({
      path: ["a", 0],
      value: 1,
      matchedPattern: LITERAL,
    });
    expect(acc[1]).toStrictEqual({
      path: ["a", 1],
      value: 2,
      matchedPattern: LITERAL,
    });
    expect(acc).toHaveLength(2);
  });
  it("should visit an array of object", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      [{ a: 1 }, { b: 2 }],
      async (match) => {
        acc.push(match);
      },
      []
    );
    expect(acc[0]).toStrictEqual({
      path: [0, "a"],
      value: 1,
      matchedPattern: LITERAL,
    });
    expect(acc[1]).toStrictEqual({
      path: [1, "b"],
      value: 2,
      matchedPattern: LITERAL,
    });
    expect(acc).toHaveLength(2);
  });

  it("should visit an object with a leaf match pattern", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      { a: 1, b: 2, c: 3 },
      async (match) => {
        acc.push(match);
      },
      [
        {
          name: "match",
          match: async (value) => {
            if (value === null || typeof value !== "object") {
              throw new Error("not an object");
            }
            return {
              matched: Object.keys(value),
              isFinalMatch: true,
            };
          },
        } as const,
      ]
    );
    expect(acc[0]).toStrictEqual({
      path: [],
      value: ["a", "b", "c"],
      matchedPattern: "match",
    });
    expect(acc).toHaveLength(1);
  });
  it("should visit an object with a non-leaf match pattern", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      { a: 1, b: 2 },
      async (match) => {
        acc.push(match);
        match.value;
      },
      [
        {
          name: "match",
          match: async (value) => {
            if (value === null || typeof value !== "object") {
              throw new Error("not an object");
            }
            return {
              matched: value,
              isFinalMatch: false,
            };
          },
        },
      ]
    );
    expect(acc[0]).toStrictEqual({
      path: [],
      value: { a: 1, b: 2 },
      matchedPattern: "match",
    });
    expect(acc[1]).toStrictEqual({
      path: ["a"],
      value: 1,
      matchedPattern: LITERAL,
    });
    expect(acc[2]).toStrictEqual({
      path: ["b"],
      value: 2,
      matchedPattern: LITERAL,
    });
    expect(acc).toHaveLength(3);
  });
  it("should visit an object with a both non-leaf and leaf match pattern", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      { a: 1, b: "2" },
      async (match) => {
        acc.push(match);
        match.value;
      },
      [
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
          name: "is anything",
          match: async (value) => {
            return { matched: null, isFinalMatch: true };
          },
        },
      ]
    );

    expect(acc[0]).toStrictEqual({
      path: [],
      value: { a: 1, b: "2" },
      matchedPattern: "is object",
    });
    expect(acc[1]).toStrictEqual({
      path: ["a"],
      value: 1,
      matchedPattern: "is number",
    });
    expect(acc[2]).toStrictEqual({
      path: ["b"],
      value: null,
      matchedPattern: "is anything",
    });

    expect(acc).toHaveLength(3);
  });
});
