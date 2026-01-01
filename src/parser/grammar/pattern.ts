import type { Parse, ParserError, ParserResult } from '../types';
import RandExp from 'randexp';
import { map, pipe, range, unique } from 'remeda';
import { tap } from '../tap';

export function pattern(regex: string): Parse<'pattern'>;
export function pattern<T extends string>(regex: string, type: T): Parse<T>;
export function pattern<T extends string>(regex: string, type: T = 'pattern' as T): Parse<T> {
  function pattern(text: string): ParserResult<T> {
    tap(pattern, text);
    const rexp = new RegExp(`^${regex}`);
    const match = rexp.exec(text);
    if (match) {
      return {
        type,
        parser: pattern,
        text: match[0],
      } satisfies ParserResult<T>;
    } else {
      const rangexp = new RandExp(regex);
      rangexp.defaultRange.subtract(-Infinity,+Infinity)
      return {
        type,
        parser: pattern,
        expected: pipe(range(0, 10),map(() => rangexp.gen()), unique()),
        got: text,
        offset: 0,
      } satisfies ParserError<T>;
    }
  }

  pattern.type = type;
  return pattern;
}