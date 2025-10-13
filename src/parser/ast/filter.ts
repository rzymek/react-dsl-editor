import { isParserSuccess, type ParserResult } from '../types';

export function filter<T extends string>(fn: (cst: ParserResult<T>) => boolean, cst: ParserResult<T>): ParserResult<T> {
  if (!isParserSuccess(cst)) {
    return cst;
  }
  const {children} = cst;
  if (!children) {
    return cst;
  }
  return {
    ...cst,
    children: children.filter(fn).map(it => filter(fn, it)),
  };
}