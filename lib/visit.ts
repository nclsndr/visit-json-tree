import { JSONValue } from "./utils/JSONTypes.js";
import { matchIsObjectLiteral } from "./utils/matchIsObjectLiteral.js";
import { matchIsJSONValue } from "./utils/matchIsJSONValue.js";

export const DEFAULT_MATCHER = Symbol("defaultMatcher");

export type VisitorPayload<
  MatchedPattern extends string | Symbol = string | Symbol,
  Value = unknown
> = {
  path: TreePath;
  matchedPattern: MatchedPattern;
  value: Value;
};

export type MatchResult<Value = unknown> =
  | {
      hasMatched: true;
      payload: Value;
      isFinalMatch: boolean;
    }
  | {
      hasMatched: false;
      payload?: undefined;
      isFinalMatch?: undefined;
    };

export type Pattern<
  Name extends string = string,
  MatchReturn extends MatchResult = MatchResult
> = {
  name: Name;
  match: (value: JSONValue, path: TreePath) => Promise<MatchResult>;
};

export type TreePath = (number | string)[];

export type ExecutePatternsResult =
  | {
      type: "finalMatch";
      patternName: string;
    }
  | {
      type: "noMatch";
    }
  | {
      type: "continue";
      patternName: string;
    }
  | {
      type: "noPatterns";
    };

export async function* executePatterns<Patterns extends ReadonlyArray<Pattern>>(
  tree: JSONValue,
  patterns: Patterns | undefined,
  path: TreePath = []
): AsyncGenerator<VisitorPayload, ExecutePatternsResult> {
  if (patterns && patterns.length > 0) {
    for (const pattern of patterns) {
      const matchResult = await pattern.match(tree, path);
      if (matchResult.hasMatched) {
        yield {
          path,
          value: matchResult.payload,
          matchedPattern: pattern.name,
        };
        if (matchResult.isFinalMatch) {
          return { type: "finalMatch", patternName: pattern.name };
        }
        return { type: "continue", patternName: pattern.name };
      }
    }
    return { type: "noMatch" };
  }
  return { type: "noPatterns" };
}

export async function* visitNode<Patterns extends ReadonlyArray<Pattern>>(
  value: JSONValue,
  patterns: Patterns | undefined,
  path: TreePath,
  executePatternsParentResult: ExecutePatternsResult
): AsyncGenerator<VisitorPayload> {
  matchIsJSONValue(value, path);

  if (executePatternsParentResult.type !== "finalMatch") {
    if (Array.isArray(value) || matchIsObjectLiteral(value)) {
      yield* visitTree(value, patterns, path);
    } else {
      const executePatternsResult = yield* executePatterns(
        value,
        patterns,
        path
      );
      if (executePatternsResult.type === "noPatterns") {
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

  if (executePatternsResult.type === "noPatterns") {
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
