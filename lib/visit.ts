import { JSONValue } from "./utils/JSONTypes.js";
import { matchIsObjectLiteral } from "./utils/matchIsObjectLiteral.js";
import { matchIsJSONValue } from "./utils/matchIsJSONValue.js";

export const DEFAULT_MATCHER = Symbol("defaultMatcher");

export type VisitorPayload<
  MatchedPattern extends string | Symbol = string | Symbol,
  Value = JSONValue
> = {
  path: TreePath;
  matchedPattern: MatchedPattern;
  value: Value;
};

export type MatchResult<Value = JSONValue> =
  | {
      hasMatched: true;
      payload: Value;
      isFinalMatch: boolean;
    }
  | {
      hasMatched: false;
    };

export type Pattern<
  Name extends string = string,
  MatchReturn extends MatchResult = MatchResult
> = {
  name: Name;
  match: (value: JSONValue) => Promise<MatchResult>;
};

export type TreePath = (number | string)[];

export type ExecutePatternsResult =
  | {
      type: "finalMatch";
    }
  | {
      type: "noMatch";
    }
  | {
      type: "continue";
    };

export async function* executePatterns<Patterns extends ReadonlyArray<Pattern>>(
  tree: JSONValue,
  patterns: Patterns | undefined,
  path: TreePath = []
): AsyncGenerator<VisitorPayload, ExecutePatternsResult> {
  if (patterns) {
    for (const pattern of patterns) {
      const matchResult = await pattern.match(tree);
      if (matchResult.hasMatched) {
        yield {
          path,
          value: matchResult.payload,
          matchedPattern: pattern.name,
        };
        if (matchResult.isFinalMatch) {
          return { type: "finalMatch" };
        }
        return { type: "continue" };
      }
    }
  }
  return { type: "noMatch" };
}

export async function* visitNode<Patterns extends ReadonlyArray<Pattern>>(
  value: JSONValue,
  patterns: Patterns | undefined,
  path: TreePath,
  executePatternsParentResult: ExecutePatternsResult
): AsyncGenerator<VisitorPayload> {
  matchIsJSONValue(value, path);

  if (Array.isArray(value) || matchIsObjectLiteral(value)) {
    yield* visitTree(value, patterns, path);
  } else {
    if (executePatternsParentResult.type !== "finalMatch") {
      const executePatternsResult = yield* executePatterns(
        value,
        patterns,
        path
      );
      if (executePatternsResult.type === "noMatch") {
        yield {
          path: path,
          value,
          matchedPattern: DEFAULT_MATCHER,
        };
      }
    }
  }
}

export async function* visitTree<Patterns extends ReadonlyArray<Pattern>>(
  tree: JSONValue,
  patterns: Patterns | undefined,
  path: TreePath = []
): AsyncGenerator<VisitorPayload> {
  matchIsJSONValue(tree, path);

  const executePatternsResult = yield* executePatterns(tree, patterns, path);

  if (executePatternsResult.type === "noMatch") {
    yield {
      path,
      value: tree,
      matchedPattern: DEFAULT_MATCHER,
    };
  }

  if (Array.isArray(tree)) {
    for (const [index, value] of tree.entries()) {
      const currentPath = [...path, index];
      yield* visitNode(value, patterns, currentPath, executePatternsResult);
    }
  } else if (matchIsObjectLiteral(tree)) {
    for (const [key, value] of Object.entries(tree)) {
      const currentPath = [...path, key];
      yield* visitNode(value, patterns, currentPath, executePatternsResult);
    }
  }
}
