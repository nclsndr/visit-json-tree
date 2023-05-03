import { describe, it, expect } from "vitest";
import { DEFAULT_MATCHER } from "./visit.js";

import { visitJSONTree } from "./visitJSONTree.js";

describe("visitJSONTree", () => {
  it("should visit a string", async () => {
    await visitJSONTree("hello", async (match) => {
      expect(match).toStrictEqual({
        path: [],
        value: "hello",
        matchedPattern: DEFAULT_MATCHER,
      });
    });
    expect.assertions(1);
  });
  it("should visit a number", async () => {
    await visitJSONTree(42, async (match) => {
      expect(match).toStrictEqual({
        path: [],
        value: 42,
        matchedPattern: DEFAULT_MATCHER,
      });
    });
    expect.assertions(1);
  });
  it("should visit a boolean", async () => {
    await visitJSONTree(true, async (match) => {
      expect(match).toStrictEqual({
        path: [],
        value: true,
        matchedPattern: DEFAULT_MATCHER,
      });
    });
    expect.assertions(1);
  });
  it("should visit a null", async () => {
    await visitJSONTree(null, async (match) => {
      expect(match).toStrictEqual({
        path: [],
        value: null,
        matchedPattern: DEFAULT_MATCHER,
      });
    });
    expect.assertions(1);
  });
  it("should visit an array", async () => {
    const acc: any[] = [];
    await visitJSONTree([1, 2, 3], async (match) => {
      acc.push(match);
    });
    expect(acc[0]).toStrictEqual({
      path: [],
      value: [1, 2, 3],
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[1]).toStrictEqual({
      path: [0],
      value: 1,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[2]).toStrictEqual({
      path: [1],
      value: 2,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[3]).toStrictEqual({
      path: [2],
      value: 3,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc).toHaveLength(4);
  });
  it("should visit an object", async () => {
    const acc: any[] = [];
    await visitJSONTree({ a: 1, b: 2, c: 3 }, async (match) => {
      acc.push(match);
    });

    expect(acc[0]).toStrictEqual({
      path: [],
      value: { a: 1, b: 2, c: 3 },
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[1]).toStrictEqual({
      path: ["a"],
      value: 1,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[2]).toStrictEqual({
      path: ["b"],
      value: 2,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[3]).toStrictEqual({
      path: ["c"],
      value: 3,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc).toHaveLength(4);
  });
  it("should visit an object of array", async () => {
    const acc: any[] = [];
    await visitJSONTree({ a: [1, 2] }, async (match) => {
      acc.push(match);
    });
    expect(acc[0]).toStrictEqual({
      path: [],
      value: { a: [1, 2] },
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[1]).toStrictEqual({
      path: ["a"],
      value: [1, 2],
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[2]).toStrictEqual({
      path: ["a", 0],
      value: 1,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[3]).toStrictEqual({
      path: ["a", 1],
      value: 2,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc).toHaveLength(4);
  });
  it("should visit an array of object", async () => {
    const acc: any[] = [];
    await visitJSONTree([{ a: 1 }, { b: 2 }], async (match) => {
      acc.push(match);
    });
    expect(acc[0]).toStrictEqual({
      path: [],
      value: [{ a: 1 }, { b: 2 }],
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[1]).toStrictEqual({
      path: [0],
      value: { a: 1 },
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[2]).toStrictEqual({
      path: [0, "a"],
      value: 1,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[3]).toStrictEqual({
      path: [1],
      value: { b: 2 },
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[4]).toStrictEqual({
      path: [1, "b"],
      value: 2,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc).toHaveLength(5);
  });
  it("should visit data with default behaviour when an empty array of patterns is provided", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      { a: [1, 2] },
      async (match) => {
        acc.push(match);
      },
      []
    );
    expect(acc[0]).toStrictEqual({
      path: [],
      value: { a: [1, 2] },
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[1]).toStrictEqual({
      path: ["a"],
      value: [1, 2],
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[2]).toStrictEqual({
      path: ["a", 0],
      value: 1,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc[3]).toStrictEqual({
      path: ["a", 1],
      value: 2,
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(acc).toHaveLength(4);
  });

  it("should visit an object with a final match pattern", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      {
        type: "color",
        value: {
          model: "rgb",
          r: 255,
          g: 0,
          b: 0,
          a: 1,
        },
      },
      async (match) => {
        acc.push(match);
      },
      [
        {
          name: "token",
          match: async (value) => {
            if (
              value === null ||
              typeof value !== "object" ||
              !("type" in value)
            ) {
              return { hasMatched: false };
            }
            return {
              hasMatched: true,
              payload: Object.keys(value),
              isFinalMatch: true,
            };
          },
        } as const,
      ]
    );
    expect(acc[0]).toStrictEqual({
      path: [],
      value: ["type", "value"],
      matchedPattern: "token",
    });
    expect(acc).toHaveLength(1);
  });
  it("should visit an object with a non-final match pattern", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      { a: 1, b: { c: true } },
      async (match) => {
        acc.push(match);
      },
      [
        {
          name: "object",
          match: async (value) => {
            if (
              value === null ||
              typeof value !== "object" ||
              Array.isArray(value)
            ) {
              return { hasMatched: false };
            }
            return {
              hasMatched: true,
              payload: "the object",
              isFinalMatch: false,
            };
          },
        } as const,
        {
          name: "any",
          match: async (value) => {
            return {
              hasMatched: true,
              payload: value,
              isFinalMatch: false,
            };
          },
        } as const,
      ]
    );
    expect(acc[0]).toStrictEqual({
      path: [],
      value: "the object",
      matchedPattern: "object",
    });
    expect(acc[1]).toStrictEqual({
      path: ["a"],
      value: 1,
      matchedPattern: "any",
    });
    expect(acc[2]).toStrictEqual({
      path: ["b"],
      value: "the object",
      matchedPattern: "object",
    });
    expect(acc[3]).toStrictEqual({
      path: ["b", "c"],
      value: true,
      matchedPattern: "any",
    });
    expect(acc).toHaveLength(4);
  });
  it("should visit an object with a both non-final and leaf match pattern", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      { a: 1, b: { c: "2" } },
      async (match) => {
        acc.push(match);
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
              return { hasMatched: false };
            }
            if (!value.a) {
              return { hasMatched: false };
            }
            return { hasMatched: true, payload: value, isFinalMatch: false };
          },
        } as const,
        {
          name: "is number",
          match: async (value) => {
            if (typeof value !== "number") {
              return { hasMatched: false };
            }
            return { hasMatched: true, payload: value, isFinalMatch: true };
          },
        } as const,
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
        } as const,
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
  });
  it("should visit an object with a both non-final and leaf match pattern on nested objects", async () => {
    const input = {
      colors: {
        blue: {
          type: "color",
          value: {
            model: "hex",
            hex: "#0000FF",
            metadata: {
              name: "Blue",
            },
          },
        },
      },
    };
    const acc: any[] = [];
    await visitJSONTree(
      input,
      async (match) => {
        acc.push(match);
      },
      [
        {
          name: "token",
          match: async (value) => {
            if (
              typeof value === "object" &&
              !Array.isArray(value) &&
              value !== null &&
              "type" in value
            ) {
              return {
                hasMatched: true,
                payload: value,
                isFinalMatch: true,
              };
            }
            return { hasMatched: false };
          },
        },
        {
          name: "group",
          match: async (value, path) => {
            if (path.length === 0) {
              return { hasMatched: false };
            }
            if (
              typeof value === "object" &&
              !Array.isArray(value) &&
              value !== null
            ) {
              return {
                hasMatched: true,
                payload: value,
                isFinalMatch: false,
              };
            }
            return { hasMatched: false };
          },
        },
      ] as const
    );

    expect(acc[0]).toStrictEqual({
      path: ["colors"],
      value: input.colors,
      matchedPattern: "group",
    });
    expect(acc[1]).toStrictEqual({
      path: ["colors", "blue"],
      value: input.colors.blue,
      matchedPattern: "token",
    });
    expect(acc).toHaveLength(2);
  });
  it("should visit an object with a both non-final and final match patterns (where last one is catch all)", async () => {
    const acc: any[] = [];
    await visitJSONTree(
      { a: 1, b: ["2"], c: { dope: true } },
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
          name: "is anything",
          match: async (value) => {
            return { hasMatched: true, payload: value, isFinalMatch: true };
          },
        },
      ]
    );

    expect(acc[0]).toStrictEqual({
      path: [],
      value: { a: 1, b: ["2"], c: { dope: true } },
      matchedPattern: "is object",
    });
    expect(acc[1]).toStrictEqual({
      path: ["a"],
      value: 1,
      matchedPattern: "is number",
    });
    expect(acc[2]).toStrictEqual({
      path: ["b"],
      value: ["2"],
      matchedPattern: "is anything",
    });
    expect(acc[3]).toStrictEqual({
      path: ["c"],
      value: { dope: true },
      matchedPattern: "is object",
    });
    expect(acc[4]).toStrictEqual({
      path: ["c", "dope"],
      value: true,
      matchedPattern: "is anything",
    });

    expect(acc).toHaveLength(5);
  });

  it("should fail visiting a function", async () => {
    await expect(
      visitJSONTree({ a: () => {} }, async () => {}, [])
    ).rejects.toThrow(
      'Value of type "function" at path "a" is not a JSON literal value'
    );
  });
});
