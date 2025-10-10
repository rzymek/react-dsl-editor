import { pattern } from './pattern.ts';
import { term } from './term.ts';
import { seq } from './seq.ts';
import { rational } from './rational.ts';
import { trimEmptyNode } from './ast/trimEmptyNode.ts';

const identifier = pattern(`[a-zA-Z_][a-zA-Z0-9_]*`, 'identifier');

function parse(input: string) {
  const expr = seq('expression',
    rational,
    term('+'),
    rational,
  );
  const func = seq('func',
    term('fun'), identifier, term('{'),
      expr,
    term('}'));
  const result = func(input);
  if ('error' in result) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  const cst = trimEmptyNode(result);
  console.log(JSON.stringify(cst, null, 2));
}


parse('fun foo { 1 2}');