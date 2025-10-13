import type { Parse, ParserResult } from './types';

export function pattern(regex: string): Parse<'pattern'>;
export function pattern<T extends string>(regex: string, type:T): Parse<T>;
export function pattern<T extends string>(regex: string, type: T = 'pattern' as T): Parse<T> {
  return (text): ParserResult<T> => {
    const rexp = new RegExp(`^${regex}`);
    const match = rexp.exec(text);
    if (match) {
      return {
        type,
        text: match[0],
      } as ParserResult<T>;
    } else {
      return {
        type,
        error: {
          expected: new RegExp(regex),
          got: text,
          offset: 0,
        },
      } as ParserResult<T>;
    }
  };
}