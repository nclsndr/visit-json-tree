import { visitTree } from "./visitTree.js";

export const makeVisitTreeGenerator = visitTree;

export { visitJSONTree } from "./visitJSONTree.js";
export type { DistributedVisitorPayload } from "./visitJSONTree.js";

export type {
  Pattern,
  TreePath,
  VisitorPayload,
  MatchResult,
} from "./definitions.js";
export type {
  JSONValue,
  JSONPrimitiveValue,
  JSONArray,
  JSONObject,
} from "./utils/JSONTypes.js";
export { ExecutePatternsResult } from "./executePatterns.js";
