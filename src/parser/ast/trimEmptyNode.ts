import { filter } from './filter';
import { CSTNode } from '../ASTNode';

export function trimEmptyNode<T extends string>(it:CSTNode<T>) {
  return filter(
    node => node.text !== '' || !!node.children,
    it
  );
}
