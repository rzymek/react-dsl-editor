import type { ParserSuccess } from '../types.ts';

export function filter(fn: (cst: ParserSuccess) => boolean, cst: ParserSuccess): ParserSuccess {
  const {children} = cst;
  if (!children) {
    return cst;
  }
  return {
    ...cst,
    children: children.filter(fn).map(filter.bind(null, fn)),
  };
}