import { isParserSuccess, type ParserSuccess, type RecoverableError } from '../types.ts';

export function filter<T extends ParserSuccess|RecoverableError>(fn: (cst: ParserSuccess|RecoverableError) => boolean, cst: T): T {
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