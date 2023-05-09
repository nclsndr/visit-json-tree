import { JSONValue } from "./utils/JSONTypes.js";
import { matchIsJSONValue } from "./utils/matchIsJSONValue.js";
import { executePatterns } from "./executePatterns.js";
import { visitNode } from "./visitNode.js";
import { matchIsObjectLiteral } from "./utils/matchIsObjectLiteral.js";
import {
  DEFAULT_MATCHER,
  Pattern,
  TreePath,
  VisitorPayload,
} from "./definitions.js";

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
