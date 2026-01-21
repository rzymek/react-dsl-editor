import {sequence} from './sequence';
import {describe, expect, it} from 'vitest';
import {term} from '../composite/term';
import {
  asException,
  isParserError,
  isParserSuccess,
  NodeTypes,
  ParserContext,
  ParserError,
  ParserSuccess,
} from '../../types';

const context: ParserContext = {
  depth: 0,
  faultToleranceMode:()=>[]
};

describe('sequence', () => {
  it('should parse a sequence of literals', () => {
    const parser = sequence(term('a'), term('b'), term('c'));
    const result = parser.parse('abc', context);
    if (isParserError(result)) throw asException(result);
    expect(result.text).toBe('abc');
    expect(result.children.map(it => it.text)).toEqual([
      'a', 'b', 'c',
    ]);
  });

  it('should return a recoverable error if one of the parsers fails', () => {
    const grammar = sequence(term('a'), term('b'), term('c'));
    const result = grammar.parse('abd', context);
    if (isParserSuccess(result)) throw new Error('Expected failure');
    expect(result).toEqual({
      expected: ['c'],
      got: 'd',
      grammar: expect.anything(),
      offset: 2,
    } satisfies ParserError<NodeTypes<typeof grammar>>);
  });

  it('should handle a sequence with a single parser', () => {
    const termA = term('a');
    const grammar = sequence(termA);
    const result = grammar.parse('a', context);
    if (isParserError(result)) throw asException(result);
    expect(result.text).toBe('a');
    expect(result.children).toEqual([
      {text: 'a', grammar: termA, children: []},
    ]);
  });

  it('should handle an empty sequence', () => {
    const grammar = sequence();
    const result = grammar.parse('abc', context);
    if (isParserError(result)) throw asException(result);
    expect(result).toEqual({
      text: '',
      children: [],
      grammar,
    } satisfies ParserSuccess<NodeTypes<typeof grammar>>);
  });
});
