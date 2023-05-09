import { JSONObject, JSONValue } from "../../lib/utils/JSONTypes.js";

type Fixture = {
  name: string;
  age: number;
  friends?: Fixture[];
};

export function generateJSONFixture(
  count: number = 5,
  depth: number = 5
): JSONValue {
  const fixture: Fixture[] = [];

  for (let i = 0; i < count; i++) {
    const name = `Person ${i + 1}`;
    const age = Math.floor(Math.random() * 100);

    const person: Fixture = { name, age };

    if (depth > 1) {
      const friends = generateJSONFixture(count, depth - 1);
      person.friends = friends as Fixture[];
    }

    fixture.push(person);
  }

  return fixture.reduce((acc, curr) => {
    // @ts-expect-error
    acc[curr.name] = curr;
    return acc;
  }, {});
}
