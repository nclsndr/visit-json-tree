import { describe, it, expect } from "vitest";

import { matchIsPrimitiveValue } from "./matchIsPrimitiveValue.js";

describe.concurrent("matchIsLiteralValue", () => {
  it("should match a string", () => {
    expect(matchIsPrimitiveValue("hello", [])).toBe(true);
  });
  it("should match a number", () => {
    expect(matchIsPrimitiveValue(42, [])).toBe(true);
  });
  it("should match a boolean", () => {
    expect(matchIsPrimitiveValue(true, [])).toBe(true);
  });
  it("should match null", () => {
    expect(matchIsPrimitiveValue(null, [])).toBe(true);
  });
  it("should not match an array", () => {
    expect(() => matchIsPrimitiveValue([], [])).toThrow(
      'Value of type "object" at path "" is not a JSON literal value'
    );
  });
  it("should not match an object", () => {
    expect(() => matchIsPrimitiveValue({}, [])).toThrow(
      'Value of type "object" at path "" is not a JSON literal value'
    );
  });
  it("should not match a function", () => {
    expect(() => matchIsPrimitiveValue(() => {}, [])).toThrow(
      'Value of type "function" at path "" is not a JSON literal value'
    );
  });
  it("should not match undefined", () => {
    expect(() => matchIsPrimitiveValue(undefined, [])).toThrow(
      'Value of type "undefined" at path "" is not a JSON literal value'
    );
  });
});
