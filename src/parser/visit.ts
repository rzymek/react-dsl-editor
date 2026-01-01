import { ParserResult } from './types';

export function visit<T extends string, V>(
  parserResult: ParserResult<T>,
  visitor: (node: ParserResult<T | 'error'>) => V | undefined,
): V[] {
  const visited = visitor(parserResult);
  const result: V[] = visited === undefined ? [] : [visited];
  return result.concat(...parserResult.children?.flatMap(child => visit(child, visitor)) ?? []);
}