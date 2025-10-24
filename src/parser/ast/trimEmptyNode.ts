import { filter } from './filter';
import { isParserError } from '../types';
import { ASTNode } from '../ASTNode';


export function trimEmptyNode<T extends string>(it:ASTNode<T>) {
  return filter(
    node => isParserError(node) || node.text !== '' || !!node.children,
    it
  );
}
