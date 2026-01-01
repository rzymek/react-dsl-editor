import { isParserError } from './types';
import { ASTNode } from './ASTNode';

export function visit<T extends string, V>(
  parserResult: ASTNode<T>,
  visitor: (node: ASTNode<T>) => V | undefined,
): V[] {
  if(isParserError(parserResult)) {
    return [];
  }
  const visited = visitor(parserResult);
  const result: V[] = visited === undefined ? [] : [visited];
  return result.concat(...parserResult.children?.flatMap(child => visit(child, visitor)) ?? []);
}