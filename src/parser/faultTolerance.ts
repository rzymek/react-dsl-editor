import {ParserError, ParserSuccess} from "./types";

export function faultTolerance<T extends string>(failing: ParserError<T>, current: ParserSuccess<T>): ParserSuccess<T> | undefined {
  if(current.children?.some(it => it.parser?.name === 'faultTolerance')) {
    return;
  }
  return {
    children: [],
    parser: function faultTolerance(): ParserError<T> {
      return failing
    },
    text: "",
    type: current.type,
  }
}