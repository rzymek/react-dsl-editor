import {Parse, ParserError, ParserSuccess} from "./types";

export function faultTolerance<T extends string>(failing: ParserError<T>, current: ParserSuccess<T>, parent: Parse<T>): ParserSuccess<T> | undefined {
  if (current?.children?.some(it => it.parser?.name === 'faultTolerance')) {
    return;
  }

  // if(parent.name === 'repeat') {
  //   if(current)
  // }

  function faultTolerance(): ParserError<T> {
    return failing
  }
  faultTolerance.suggestions = () => [] as string[]
  faultTolerance.type = 'faultTolerance'
  return {
    children: [],
    parser: faultTolerance,
    text: "",
    type: current?.type ?? 'fault-correction' as T,
  }
}