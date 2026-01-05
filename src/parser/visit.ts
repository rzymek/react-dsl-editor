import { isParserError, ParserSuccess } from './types';

export function visit<T extends string, V = string>(
  parserResult: ParserSuccess<T>,
  type: T,
  extractor: (node: ParserSuccess<T>) => V = node => node.text as V,
): V[] {
  if (isParserError(parserResult)) {
    return [];
  }
  const result = parserResult.grammar.type === type ? [extractor(parserResult)] : [];
  return result.concat(
    ...parserResult.children?.flatMap(child => visit(child, type, extractor)) ?? [],
  );
}