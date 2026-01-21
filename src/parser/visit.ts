import { isParserError, ParserSuccess } from './types';
import {nodeName} from "./grammar/core";

export function visit<T extends string, V = string>(
  parserResult: ParserSuccess<T>,
  type: T[],
  extractor: (node: ParserSuccess<T>) => V = node => node.text as V,
): V[] {
  if (isParserError(parserResult)) {
    return [];
  }
  // const filter = (parserResult: ParserSuccess<T>) => parserResult.grammar.type === type;
  const filter = (parserResult: ParserSuccess<T>) => {
    const metaName = nodeName(parserResult);
    return metaName !== undefined && type.includes(metaName);
  };
  const result = filter(parserResult)
    ? [extractor(parserResult)]
    : [];
  return result.concat(
    ...parserResult.children?.flatMap(child => visit(child, type, extractor)) ?? [],
  );
}