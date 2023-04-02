import { JSONValue } from "./utils/JSONTypes.js";
import { matchIsObjectLiteral } from "./utils/matchIsObjectLiteral.js";
import { matchIsPrimitiveValue } from "./utils/matchIsPrimitiveValue.js";

export const LITERAL = Symbol("literal");

export type VisitorPayload<P extends Pattern> = {
  path: TreePath;
  value: Awaited<ReturnType<P["match"]>>;
  matchedPattern: P["name"] | typeof LITERAL;
};

export type Pattern<
  Name extends string = string,
  MatchReturn extends any = JSONValue,
  IsLeaf extends boolean = boolean
> = {
  name: Name;
  match: (value: JSONValue) => Promise<MatchReturn>;
  isLeaf: IsLeaf;
};

export type TreePath = (number | string)[];

export async function* executePatterns<Patterns extends ReadonlyArray<Pattern>>(
  tree: JSONValue,
  patterns: Patterns,
  path: TreePath
): AsyncGenerator<VisitorPayload<Patterns[number]>, boolean> {
  for (const pattern of patterns) {
    try {
      const result = await pattern.match(tree);
      yield {
        path,
        value: result,
        matchedPattern: pattern.name,
      } as any;
      if (pattern.isLeaf) {
        return true;
      }
      break;
    } catch (error) {}
  }
  return false;
}

export async function* visitNode<Patterns extends ReadonlyArray<Pattern>>(
  value: JSONValue,
  patterns: Patterns,
  path: TreePath
): AsyncGenerator<VisitorPayload<Patterns[number]>> {
  const hasMatchedOnLeaf = yield* executePatterns(value, patterns, path);
  if (hasMatchedOnLeaf) {
    return;
  }

  if (Array.isArray(value) || matchIsObjectLiteral(value)) {
    yield* visitTree(value, patterns, path);
  } else {
    matchIsPrimitiveValue(value, path);
    yield {
      path,
      value: value as any,
      matchedPattern: LITERAL,
    };
  }
}

export async function* visitTree<Patterns extends ReadonlyArray<Pattern>>(
  tree: JSONValue,
  patterns: Patterns,
  path: TreePath = []
): AsyncGenerator<VisitorPayload<Patterns[number]>> {
  const hasMatchedOnLeaf = yield* executePatterns(tree, patterns, path);
  if (hasMatchedOnLeaf) {
    return;
  }

  if (Array.isArray(tree)) {
    for (const [index, value] of tree.entries()) {
      const currentPath = [...path, index];
      yield* visitNode(value, patterns, currentPath);
    }
  } else if (matchIsObjectLiteral(tree)) {
    for (const [key, value] of Object.entries(tree)) {
      const currentPath = [...path, key];
      yield* visitNode(value, patterns, currentPath);
    }
  } else {
    yield* visitNode(tree, patterns, path);
  }
}
