import type { Parse, ParserResult } from './types';

export function term<T extends string>(str: T): Parse<T>;
export function term<T extends string>(str: string, type: T): Parse<T>;
export function term<T extends string>(str: string, _type?: T): Parse<T> {
  const type = _type ?? str as T;
  return (text): ParserResult<T> => {
    if (text.startsWith(str)) {
      return {
        type,
        text: str,
        errors: [],
      };
    } else {
      return {
        type,
        text: '',
        errors: [{
          expected: str,
          got: text,
          offset: 0,
          type,
        }],
      };
    }
  };
}
