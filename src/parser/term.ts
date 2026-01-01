import type { Parse, ParserResult } from './types';

export function term<T extends string>(str: T): Parse<T>;
export function term<T extends string>(str: string, type: T): Parse<T>;
export function term<T extends string>(str: string, _type?: T): Parse<T> {
  const type = _type ?? str as T;

  function term(text:string): ParserResult<T> {
    if (text.startsWith(str)) {
      return {
        type,
        parser: term,
        text: str,
        errors: [],
      };
    } else {
      return {
        type,
        parser: term,
        text: '',
        errors: [{
          expected: str,
          got: text,
          offset: 0,
          type,
        }],
      };
    }
  }

  term.type = type;
  return term;
}
