import type { Parse, ParserResult } from './types.ts';

export function term(str: string): Parse<'term'>;
export function term<T extends string>(type: T, str: string): Parse<T>;
export function term<T extends string>(typeOrStr: string, strOrUndefined?: string): Parse<T> {
  const type = strOrUndefined === undefined ? 'term' : typeOrStr;
  const str = strOrUndefined ?? typeOrStr;
  return (text):ParserResult<T> => {
    if (text.startsWith(str)) {
      return {
        type,
        text: str,
      } as ParserResult<T>;
    } else {
      return {
        type,
        error: {
          expected: str,
          got: text,
          offset: 0,
        },
      } as ParserResult<T>;
    }
  };
}
