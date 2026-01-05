import { CSTNode } from '../ASTNode';

export function filter<T extends string>(fn: (cst: CSTNode<T>) => boolean, cst: CSTNode<T>): CSTNode<T> {
  const {children} = cst;
  if (!children) {
    return cst;
  }
  return {
    ...cst,
    children: children.filter(fn).map(it => filter(fn, it)),
  };
}