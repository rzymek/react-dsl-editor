import type { Parse, ParserResult } from './types';

export function pattern(regex: string): Parse<'pattern'>;
export function pattern<T extends string>(regex: string, type: T): Parse<T>;
export function pattern<T extends string>(regex: string, type: T = 'pattern' as T): Parse<T> {
  function pattern(text: string): ParserResult<T> {
    const rexp = new RegExp(`^${regex}`);
    const match = rexp.exec(text);
    if (match) {
      return {
        type,
        parser: pattern,
        text: match[0],
        errors: [],
      } satisfies ParserResult<T>;
    } else {
      return {
        type,
        parser: pattern,
        text: '',
        errors: [{
          expected: new RegExp(regex),
          got: text,
          offset: 0,
          type,
        }],
      } satisfies ParserResult<T>;
    }
  }

  pattern.type = type;
  return pattern;
}