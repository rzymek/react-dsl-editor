import { isParserError, type Parse, ParserError, ParserSuccess } from '../types';
import { map, only, pipe, sortBy, take } from 'remeda';

export function alternative<T extends string>(type: T = 'alternative' as T, ...seq: Parse<T>[]): Parse<T> {
  function alternative(text: string) {
    const errors: ParserError<T>[] = [];
    for (const parser of seq) {
      const result = parser(text);
      if (isParserError(result)) {
        errors.push(result);
      } else {
        return {
          type,
          parser: alternative,
          text: result.text,
          children: [result],
        } satisfies ParserSuccess<T>;
      }
    }
    return {
      offset: 0,
      expected: errors.flatMap(e => e.expected),
      got: pipe(
        errors,
        map(it => it.got),
        sortBy([it => it.length, 'desc']),
        take(1),
        only(),
      )!,
      type,
      parser: alternative,
    } satisfies ParserError<T>;
  }

  alternative.type = type;
  return alternative;
}