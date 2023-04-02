import { visitTree } from "./visit.js";

export { visitJSONTree } from "./visitJSONTree.js";

const makeVisitGenerator = visitTree;

export type { Pattern, TreePath, VisitorPayload } from "./visit.js";
export type {
  JSONValue,
  JSONPrimitiveValue,
  JSONArray,
  JSONObject,
} from "./utils/JSONTypes.js";
