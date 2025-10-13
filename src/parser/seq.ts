import type { Parse } from './types';
import { sequence } from './sequence';
import { optionalWhitespace } from './optionalWhitespace';

export function seq<T extends string>(type: T = 'seq' as T, ...p: Parse<T>[]): Parse<T | 'optionalWhitespace'> {
  return sequence<T | 'optionalWhitespace'>(type as T,
    optionalWhitespace, ...p.flatMap(it => [it, optionalWhitespace]),
  );
}
