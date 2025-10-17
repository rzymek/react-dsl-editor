import { pattern, seq, rational, term, sequence, ws, optionalWhitespace } from '../parser';

const identifier = pattern(`[a-zA-Z_][a-zA-Z0-9_]*`, 'identifier');
const keyword = (text: string) => term(text, 'keyword');

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