import { pattern } from '../parser/pattern.ts';
import { seq } from '../parser/seq.ts';
import { rational } from '../parser/rational.ts';
import { term } from '../parser/term.ts';

const identifier = pattern(`[a-zA-Z_][a-zA-Z0-9_]*`, 'identifier');

const expr = seq('expression',
  rational,
  term('+'),
  rational,
);
const func = seq('func',
  term('fun'), identifier, term('{'),
  expr,
  term('}'));


export const funcParser = func;
