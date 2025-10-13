import { pattern } from '../parser/pattern.ts';
import { seq } from '../parser/seq.ts';
import { rational } from '../parser/rational.ts';
import { term } from '../parser/term.ts';
import { sequence } from '../parser/sequence.ts';
import { ws } from '../parser/ws.ts';
import { optionalWhitespace } from '../parser/optionalWhitespace.ts';

const identifier = pattern(`[a-zA-Z_][a-zA-Z0-9_]*`, 'identifier');
const keyword = (text: string) => term('keyword', text);

const expr = seq('expression',
  rational,
  term('+'),
  rational,
);
const func = sequence('func',
  optionalWhitespace,
  keyword('fun'), ws, identifier, optionalWhitespace, term('{'),
  /**/expr,
  term('}'),
  optionalWhitespace);


export const funcParser = func;