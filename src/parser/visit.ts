import {isParserError, ParserSuccess} from './types';
import {nodeName} from "./grammar/core";

export function visit<T extends string, V = string>(
  parserResult: ParserSuccess<T>,
  type: T[],
  extractor: (node: ParserSuccess<T>) => V = node => node.text as V,
): V[] {
  return visitPredicate(parserResult, (parserResult: ParserSuccess<T>) => {
    const metaName = nodeName(parserResult);
    return metaName !== undefined && type.includes(metaName);
  }, extractor)
}

export function visitPredicate<T extends string, V = string>(
  parserResult: ParserSuccess<T>,
  filter: (v: ParserSuccess<T>) => boolean,
  extractor: (node: ParserSuccess<T>) => V = node => node.text as V,
): V[] {
  if (isParserError(parserResult)) {
    return [];
  }
  // const filter = (parserResult: ParserSuccess<T>) => parserResult.grammar.type === type;
  const result = filter(parserResult)
    ? [extractor(parserResult)]
    : [];
  return result.concat(
    ...parserResult.children?.flatMap(child => visitPredicate(child, filter, extractor)) ?? [],
  );
}

export function extractAll<T extends string>(parserResult: ParserSuccess<T>, type: T): string[] {
  return visit(parserResult, [type]);
}

export function extractFirst<T extends string>(result: ParserSuccess<T>, name: T): string | undefined {
  if (isParserError(result)) {
    return undefined;
  }
  if (nodeName(result) === name) {
    return result.text;
  } else if (result.children?.length > 0) {
    for (const child of result.children) {
      const v = extractFirst(child, name)
      if (v) {
        return v;
      }
    }
  }
  return undefined;
}
