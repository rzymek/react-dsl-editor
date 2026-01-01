import { isParserError, ParserResult, ParserSuccess } from './types';

export function visit<T extends string, V>(
  parserResult: ParserResult<T>,
  visitor: (node: ParserSuccess<T>) => V | undefined,
): V[] {
  if(isParserError(parserResult)) {
    return [];
  }
  const visited = visitor(parserResult);
  const result: V[] = visited === undefined ? [] : [visited];
  return result.concat(...parserResult.children?.flatMap(child => visit(child, visitor)) ?? []);
}