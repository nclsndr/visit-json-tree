import type { JSONValue } from "./utils/JSONTypes.js";
import type { Pattern, TreePath, VisitorPayload } from "./definitions.js";
import { matchIsJSONValue } from "./utils/matchIsJSONValue.js";
import { matchIsObjectLiteral } from "./utils/matchIsObjectLiteral.js";
import { DEFAULT_MATCHER } from "./definitions.js";
import { executePatterns, ExecutePatternsResult } from "./executePatterns.js";
import { visitTree } from "./visitTree.js";

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
