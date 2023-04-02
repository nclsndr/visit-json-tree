import { describe, it, expect } from "vitest";

import { matchIsJSONValue } from "./matchIsJSONValue.js";

describe.concurrent("matchIsJSONValue", () => {
  it("should match an object", () => {
    expect(matchIsJSONValue({}, [])).toBe(true);
  });
  it("should match an array", () => {
    expect(matchIsJSONValue([], [])).toBe(true);
  });
  it("should match a string", () => {
    expect(matchIsJSONValue("hello", [])).toBe(true);
  });
  it("should match a number", () => {
    expect(matchIsJSONValue(42, [])).toBe(true);
  });
  it("should match a boolean", () => {
    expect(matchIsJSONValue(true, [])).toBe(true);
  });
  it("should match null", () => {
    expect(matchIsJSONValue(null, [])).toBe(true);
  });
  it("should not match a function", () => {
    expect(() => matchIsJSONValue(() => {}, [])).toThrow(
      'Value of type "function" at path "" is not a JSON literal value'
    );
  });
  it("should not match undefined", () => {
    expect(() => matchIsJSONValue(undefined, [])).toThrow(
      'Value of type "undefined" at path "" is not a JSON literal value'
    );
  });
});
