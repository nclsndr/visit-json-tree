import { visitTree } from "./visit.js";

export const makeVisitGenerator = visitTree;

export { visitJSONTree } from "./visitJSONTree.js";
export type { DistributedVisitorPayload } from "./visitJSONTree.js";

export type {
  Pattern,
  TreePath,
  VisitorPayload,
  ExecutePatternsResult,
  MatchResult,
} from "./visit.js";
export type {
  JSONValue,
  JSONPrimitiveValue,
  JSONArray,
  JSONObject,
} from "./utils/JSONTypes.js";
