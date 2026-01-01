import type { Parse, ParserError, ParserResult, ParserSuccess } from '../types';

export function term<T extends string>(str: T): Parse<T>;
export function term<T extends string>(str: string, type: T): Parse<T>;
export function term<T extends string>(str: string, _type?: T): Parse<T> {
  const type = _type ?? str as T;

  function term(text: string): ParserResult<T> {
    if (text.startsWith(str)) {
      return {
        type,
        parser: term,
        text: str,
      } satisfies ParserSuccess<T>;
    } else {
      return {
        type,
        parser: term,
        expected: [str],
        got: text,
        offset: 0,
      } satisfies ParserError<T>;
    }
  }

  term.type = type;
  return term;
}
