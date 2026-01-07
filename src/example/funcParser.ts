import { pattern } from '../parser/grammar/core/pattern';
import { seq } from '../parser/grammar/composite/seq';
import { rational } from '../parser/grammar/composite/rational';
import { term } from '../parser/grammar/composite/term';
import { sequence } from '../parser/grammar/core/sequence';
import { ws } from '../parser/grammar/composite/ws';
import { repeat } from '../parser/grammar/core/repeat';

const identifier = pattern(/[a-zA-Z_][a-zA-Z0-9_]*/);

const expr = seq(
  rational,
  term('+'),
  rational,
);

const func = sequence(
  ws,
  term('fun'), ws, identifier, ws, term('{'),
  expr,
  term('}'),
  ws);

const functions = repeat(func);

export const funcParser = functions;