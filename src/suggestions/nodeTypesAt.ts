import { ASTNode } from '../parser';

export function nodeTypesAt<T extends string>(ast: ASTNode<T>, cursorPositon: number, offset = 0): ASTNode<T>[] {
  const nodesAt: ASTNode<T>[] = [];
  if (offset < cursorPositon && cursorPositon <= offset + ast.text.length) {
    nodesAt.push(ast);
    const {children = []} = ast;
    for(const child of children) {
      nodesAt.push(...nodeTypesAt(child, cursorPositon, offset));
      offset += child.text.length;
    }
  }
  return nodesAt;
}