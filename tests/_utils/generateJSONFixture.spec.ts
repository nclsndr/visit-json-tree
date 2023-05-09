import { describe, it, expect } from "vitest";

import { generateJSONFixture } from "./generateJSONFixture.js";

describe("generateJSONFixture", () => {
  it("should generate a JSON fixture of length 1 and depth 1", () => {
    const generated = generateJSONFixture(1, 1) as any;

    expect(generated["Person 1"]).toBeDefined();
    expect(generated["Person 1"].name).toBe("Person 1");
    expect(generated["Person 1"].friends).not.toBeDefined();
  });
  it("should generate a JSON fixture of length 2 and depth 2", () => {
    const generated = generateJSONFixture(2, 2) as any;

    expect(generated["Person 1"]).toBeDefined();
    expect(generated["Person 1"].name).toBe("Person 1");
    expect(generated["Person 1"].friends).toBeDefined();
    expect(generated["Person 1"].friends["Person 1"].name).toBe("Person 1");
    expect(generated["Person 1"].friends["Person 2"].name).toBe("Person 2");
    expect(generated["Person 2"].friends["Person 1"].name).toBe("Person 1");
    expect(generated["Person 2"].friends["Person 2"].name).toBe("Person 2");
    expect(generated["Person 1"].friends["Person 1"].friends).not.toBeDefined();
  });
});
