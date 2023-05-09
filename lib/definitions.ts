import { JSONValue } from "./utils/JSONTypes.js";

export const DEFAULT_MATCHER = Symbol("defaultMatcher");

export type VisitorPayload<
  MatchedPattern extends string | Symbol = string | Symbol,
  Value = unknown
> = {
  path: TreePath;
  matchedPattern: MatchedPattern;
  value: Value;
};

export type MatchResult<Value = unknown> =
  | {
      hasMatched: true;
      payload: Value;
      isFinalMatch: boolean;
    }
  | {
      hasMatched: false;
      payload?: undefined;
      isFinalMatch?: undefined;
    };

export type Pattern<
  Name extends string = string,
  MatchReturn extends MatchResult = MatchResult
> = {
  name: Name;
  match: (value: JSONValue, path: TreePath) => Promise<MatchResult>;
};

export type TreePath = (number | string)[];
