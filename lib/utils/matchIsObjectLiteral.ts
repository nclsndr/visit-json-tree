import { JSONObject } from "./JSONTypes.js";

export function matchIsObjectLiteral(value: unknown): value is JSONObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
