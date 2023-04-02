import type { TreePath } from "../visit.js";
import { JSONPrimitiveValue } from "./JSONTypes.js";

export function matchIsPrimitiveValue(
  value: unknown,
  path: TreePath
): value is JSONPrimitiveValue {
  const isLiteralValue =
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null;
  if (isLiteralValue === false) {
    throw new Error(
      `Value of type "${typeof value}" at path "${path.join(
        "."
      )}" is not a JSON literal value`
    );
  }
  return true;
}
