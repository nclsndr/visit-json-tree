import type { JSONValue } from "./utils/JSONTypes.js";
import type { Pattern, TreePath, VisitorPayload } from "./definitions.js";

export type ExecutePatternsResult =
  | {
      type: "finalMatch";
      patternName: string;
    }
  | {
      type: "noMatch";
      patternNames: string[];
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
    return { type: "noMatch", patternNames: patterns.map((p) => p.name) };
  }
  return { type: "noPatterns" };
}
