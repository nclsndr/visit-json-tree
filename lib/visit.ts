import { JSONValue } from "./utils/JSONTypes.js";
import { matchIsObjectLiteral } from "./utils/matchIsObjectLiteral.js";
import { matchIsJSONValue } from "./utils/matchIsJSONValue.js";

export const DEFAULT_MATCHER = Symbol("defaultMatcher");

export type VisitorPayload<P extends Pattern> = {
  path: TreePath;
  value: Awaited<ReturnType<P["match"]>>["matched"];
  matchedPattern: P["name"] | typeof DEFAULT_MATCHER;
};

export type MatchResult<
  Value = JSONValue,
  Continue extends boolean = boolean
> = {
  matched: Value;
  isFinalMatch: boolean;
};

export type Pattern<
  Name extends string = string,
  MatchReturn extends MatchResult = MatchResult
> = {
  name: Name;
  match: (value: JSONValue) => Promise<MatchResult>;
};

export type TreePath = (number | string)[];

type ExecutePatternsResult =
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
  patterns: Patterns,
  path: TreePath = []
): AsyncGenerator<VisitorPayload<Patterns[number]>, ExecutePatternsResult> {
  for (const pattern of patterns) {
    try {
      const { matched, isFinalMatch } = await pattern.match(tree);
      yield {
        path,
        value: matched,
        matchedPattern: pattern.name,
      };
      if (isFinalMatch) {
        return { type: "finalMatch" };
      }
      return { type: "continue" };
    } catch (error) {}
  }
  return { type: "noMatch" };
}

export async function* visitNode<Patterns extends ReadonlyArray<Pattern>>(
  value: JSONValue,
  patterns: Patterns,
  path: TreePath,
  executePatternsParentResult: ExecutePatternsResult
): AsyncGenerator<VisitorPayload<Patterns[number]>> {
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
  patterns: Patterns,
  path: TreePath = []
): AsyncGenerator<VisitorPayload<Patterns[number]>> {
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
