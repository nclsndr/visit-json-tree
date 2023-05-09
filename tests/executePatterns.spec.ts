import { describe, it, expect } from "vitest";

import { Pattern } from "../lib/definitions.js";
import { JSONValue } from "../lib/utils/JSONTypes.js";
import { executePatterns } from "../lib/executePatterns.js";

describe.concurrent("executePatterns", () => {
  it("should return `noPatterns` when no patterns provided", async () => {
    const tree: JSONValue = {};

    const asyncGenerator = executePatterns(tree, []);

    const result = await asyncGenerator.next();
    expect(result.value).toStrictEqual({ type: "noPatterns" });
  });
  it("should return `continue` when the pattern matches with `isFinalMatch: false`", async () => {
    const tree: JSONValue = { a: true };
    const patterns = [
      {
        name: "object with a",
        match: async (value, path) => {
          if (value !== null && typeof value === "object" && "a" in value) {
            return {
              hasMatched: true,
              payload: value,
              isFinalMatch: false,
            };
          }
          return {
            hasMatched: false,
          };
        },
      },
    ] satisfies Array<Pattern>;

    const asyncGenerator = executePatterns(tree, patterns);

    const matchCallbackResult = await asyncGenerator.next();
    expect(matchCallbackResult.value).toStrictEqual({
      path: [],
      value: { a: true },
      matchedPattern: "object with a",
    });

    const matchPatternResult = await asyncGenerator.next();
    expect(matchPatternResult.value).toStrictEqual({
      type: "continue",
      patternName: "object with a",
    });

    expect(matchPatternResult.done).toBe(true);
  });
  it("should return `finalMatch` when the pattern matches with `isFinalMatch: true`", async () => {
    const tree: JSONValue = { a: true };
    const patterns = [
      {
        name: "object with a",
        match: async (value, path) => {
          if (value !== null && typeof value === "object" && "a" in value) {
            return {
              hasMatched: true,
              payload: value,
              isFinalMatch: true,
            };
          }
          return {
            hasMatched: false,
          };
        },
      },
    ] satisfies Array<Pattern>;

    const asyncGenerator = executePatterns(tree, patterns);

    const matchCallbackResult = await asyncGenerator.next();
    expect(matchCallbackResult.value).toStrictEqual({
      path: [],
      value: { a: true },
      matchedPattern: "object with a",
    });

    const matchPatternResult = await asyncGenerator.next();
    expect(matchPatternResult.value).toStrictEqual({
      type: "finalMatch",
      patternName: "object with a",
    });

    expect(matchPatternResult.done).toBe(true);
  });
  it("should return `noMatch` when the pattern does not match", async () => {
    const tree: JSONValue = { a: true };
    const patterns = [
      {
        name: "always falsy",
        match: async (value, path) => {
          return {
            hasMatched: false,
          };
        },
      },
    ] satisfies Array<Pattern>;

    const asyncGenerator = executePatterns(tree, patterns);

    const matchPatternResult = await asyncGenerator.next();
    expect(matchPatternResult.value).toStrictEqual({
      type: "noMatch",
      patternNames: ["always falsy"],
    });

    expect(matchPatternResult.done).toBe(true);
  });
});
