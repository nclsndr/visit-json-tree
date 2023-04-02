import { JSONValue } from "./utils/JSONTypes.js";
import {
  DEFAULT_MATCHER,
  MatchResult,
  Pattern,
  VisitorPayload,
  visitTree,
} from "./visit.js";

export type DistributedVisitorPayload<P extends Pattern> = P extends {
  name: infer Name extends string | symbol;
  match: (...args: any[]) => Promise<infer MR extends MatchResult>;
}
  ? VisitorPayload<Name, Extract<MR, { hasMatched: true }>["payload"]>
  : never;

export async function visitJSONTree<Patterns extends ReadonlyArray<Pattern>>(
  tree: unknown,
  callback: (
    payload: Patterns extends undefined
      ? VisitorPayload<typeof DEFAULT_MATCHER, JSONValue>
      : DistributedVisitorPayload<Patterns[number]>
  ) => Promise<void>,
  patterns?: Patterns
) {
  const generator = visitTree(tree as JSONValue, patterns);
  while (true) {
    const { value, done } = await generator.next();
    if (done) {
      break;
    }
    await callback(
      value as Patterns extends undefined
        ? VisitorPayload<typeof DEFAULT_MATCHER, JSONValue>
        : DistributedVisitorPayload<Patterns[number]>
    );
  }
}
