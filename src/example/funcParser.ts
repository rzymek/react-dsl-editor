import { pattern, seq, rational, term, sequence, ws, optionalWhitespace, repeat } from '../parser';

const identifier = pattern(`[a-zA-Z_][a-zA-Z0-9_]*`, 'identifier');

const expr = seq('expression',
  rational,
  term('+'),
  rational,
);

const func = sequence('func',
  optionalWhitespace,
  term('fun'), ws, identifier, optionalWhitespace, term('{'),
  /**/expr,
  term('}'),
  optionalWhitespace);

const functions = repeat('functions', func);

export const funcParser = functions;