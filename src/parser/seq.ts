import type { Parse } from './types.ts';
import { sequence } from './sequence.ts';
import { optionalWhitespace } from './optionalWhitespace.ts';

export function seq<T extends string>(type: T = 'seq' as T, ...p: Parse<T>[]): Parse<T | 'optionalWhitespace'> {
  return sequence<T | 'optionalWhitespace'>(type as T,
    optionalWhitespace, ...p.flatMap(it => [it, optionalWhitespace]),
  );
}
