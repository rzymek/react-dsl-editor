import { CSTNode } from '../parser/CSTNode';

export function cstPathAt<T extends string>(input: CSTNode<T>, cursor: number): CSTNode<T>[] {
  return _cstPathAt(input, cursor, [])
}

function _cstPathAt<T extends string>(input: CSTNode<T>, cursor: number, path: CSTNode<T>[] = []): CSTNode<T>[] {
  if (!(input.offset <= cursor && cursor <= input.end)) {
    return [];
  }
  path.push(input);
  input.children?.forEach(it => _cstPathAt(it, cursor, path));
  return path;
}