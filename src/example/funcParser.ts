import { pattern } from '../parser/pattern';
import { seq } from '../parser/seq';
import { rational } from '../parser/rational';
import { term } from '../parser/term';
import { sequence } from '../parser/sequence';
import { ws } from '../parser/ws';
import { optionalWhitespace } from '../parser/optionalWhitespace';

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