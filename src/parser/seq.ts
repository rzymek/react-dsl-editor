import type { Parser } from './types.ts';
import { sequence } from './sequence.ts';
import { optionalWhitespace } from './optionalWhitespace.ts';

export function seq(type = 'seq', ...p: Parser[]): Parser {
  return sequence(type,
    optionalWhitespace, ...p.flatMap(it => [it, optionalWhitespace]),
  );
}