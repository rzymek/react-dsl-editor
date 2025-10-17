import type { Parse, ParserResult } from './types';

export function term<T extends string>(str: string, type = 'term' as T): Parse<T> {
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
        }],
      };
    }
  };
}
