import { describe, expect, it } from 'vitest';
import { sequence } from './sequence';
import { repeat } from './repeat';
import { term } from '../composite/term';
import { isParserError, isParserSuccess, NodeTypes, ParserContext, ParserError } from '../../types';

const context: ParserContext = {
  faultTolerant: false,
  faultCorrection: it => it,
};

describe('repeat', () => {
  it('defaults', () => {
    const grammar = repeat(term('.'));
    const ast = grammar.parse('....xx', context);
    expect(isParserSuccess(ast)).toBe(true);
    if (isParserSuccess(ast)) {
      expect(ast.text).toEqual('....');
    }
  });
  it('max', () => {
    const grammar = repeat(term('.'), 1, 2);
    const ast = grammar.parse('....xx', context);
    expect(isParserSuccess(ast)).toBe(true);
    if (isParserSuccess(ast)) {
      expect(ast.text).toEqual('..');
    }
  });

  it('min', () => {
    const grammar = repeat(term('.'), 3);
    const ast = grammar.parse('..xx', context);
    expect(isParserError(ast)).toBe(true);
    if (isParserError(ast)) {
      expect(ast).toEqual({
        expected: ['.'],
        got: 'xx',
        grammar: ast.grammar,
      } satisfies ParserError<NodeTypes<typeof grammar>>);
    }
  });
  it('repeat seq', () => {
    const grammar = repeat(sequence(term('y')));
    const ast = grammar.parse('x', context);
    expect(isParserError(ast)).toBe(true);
    if (isParserError(ast)) {
      expect(ast).toEqual({
        expected: ['y'],
        got: 'x',
        grammar: ast.grammar,
      } satisfies ParserError<NodeTypes<typeof grammar>>);
    }
  });
});
