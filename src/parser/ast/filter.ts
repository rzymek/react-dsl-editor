import { isParserSuccess } from '../types';
import { ASTNode } from '../ASTNode';

export function filter<T extends string>(fn: (cst: ASTNode<T>) => boolean, cst: ASTNode<T>): ASTNode<T> {
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