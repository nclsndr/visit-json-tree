import { JSONValue } from "./utils/JSONTypes.js";
import { Pattern, VisitorPayload, visitTree } from "./visit.js";

export async function visitJSONTree<
  Patterns extends ReadonlyArray<Readonly<Pattern>>
>(
  tree: unknown,
  callback: (payload: VisitorPayload<Patterns[number]>) => Promise<void>,
  patterns: Patterns
) {
  const generator = visitTree(tree as JSONValue, patterns);
  while (true) {
    const { value, done } = await generator.next();
    if (done) {
      break;
    }
    await callback(value as VisitorPayload<Patterns[number]>);
  }
}
