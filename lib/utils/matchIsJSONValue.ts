import type { TreePath } from "../visit.js";
import { JSONValue } from "./JSONTypes.js";
import { matchIsPrimitiveValue } from "./matchIsPrimitiveValue.js";
import { matchIsObjectLiteral } from "./matchIsObjectLiteral.js";

export function matchIsJSONValue(
  value: unknown,
  path: TreePath
): value is JSONValue {
  return (
    Array.isArray(value) ||
    matchIsObjectLiteral(value) ||
    matchIsPrimitiveValue(value, path)
  );
}
