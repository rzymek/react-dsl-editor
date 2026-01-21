import {map, pipe, sum} from "remeda";
import {getErrors} from "./getErrors";
import {ParserSuccess} from "./types";
import {withOffset} from "./withOffset";
import {disjointIntervals} from "../editor/disjointIntervals";

export function totalErrorsLength(result: ParserSuccess<string>): number {
  const errors = getErrors(withOffset(result), 1);
  return pipe(
    disjointIntervals(errors),
    map(it => Math.max(1, it.end - it.start)),
    sum(),
  );
}