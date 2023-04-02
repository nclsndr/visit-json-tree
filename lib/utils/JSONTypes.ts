export type JSONPrimitiveValue = string | number | boolean | null;
export type JSONObject = { [name: string]: JSONValue };
export type JSONArray = JSONValue[];
export type JSONValue = JSONPrimitiveValue | JSONArray | JSONObject;
