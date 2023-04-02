import { describe, it, expect } from "vitest";
import { matchIsObjectLiteral } from "./matchIsObjectLiteral.js";

describe.concurrent("matchIsObjectLiteral", () => {
  it("should match an object", () => {
    expect(matchIsObjectLiteral({})).toBe(true);
  });
  it("should not match an array", () => {
    expect(matchIsObjectLiteral([])).toBe(false);
  });
  it("should not match a string", () => {
    expect(matchIsObjectLiteral("hello")).toBe(false);
  });
  it("should not match a number", () => {
    expect(matchIsObjectLiteral(42)).toBe(false);
  });
  it("should not match a boolean", () => {
    expect(matchIsObjectLiteral(true)).toBe(false);
  });
  it("should not match null", () => {
    expect(matchIsObjectLiteral(null)).toBe(false);
  });
  it("should not match a function", () => {
    expect(matchIsObjectLiteral(() => {})).toBe(false);
  });
  it("should not match undefined", () => {
    expect(matchIsObjectLiteral(undefined)).toBe(false);
  });
});
