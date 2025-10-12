import { isParserSuccess, type ParserResult } from '../types.ts';

export function filter(fn: (cst: ParserResult) => boolean, cst: ParserResult): ParserResult {
  if(!isParserSuccess(cst)) {
    return cst;
  }
  const {children} = cst;
  if (!children) {
    return cst;
  }
  return {
    ...cst,
    children: children.filter(fn).map(filter.bind(null, fn)),
  };
}