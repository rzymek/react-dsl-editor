import {describe, expect, it} from 'vitest';
import {term} from './term';
import {asException, isParserError, isParserSuccess, ParserContext} from '../../types';

const context: ParserContext = {
  depth: 0,
  faultToleranceMode:()=>[]
};

describe('term', () => {
  it('suggestions', () => {
    expect(term('abc').suggestions()).toEqual(['abc']);
  });

  it('should parse term', () => {
    const terminal = 'abc';
    const parser = term(terminal).parse;
    const result = parser(terminal, context);
    if (isParserError(result)) {
      throw asException(result);
    }
    expect(result.text).toEqual(terminal);
    expect(result.children).toEqual([]);
  });

  it('should ignore extra', () => {
    const parser = term('abc').parse;
    const result = parser('abcdef', context);
    if (isParserError(result)) {
      throw asException(result);
    }
    expect(result.text).toEqual('abc');
    expect(result.children).toEqual([]);
  });

  it('should reject not matching', () => {
    const grammar = term('abc');
    const parser = grammar.parse;
    const result = parser('def', context);

    expect(isParserError(result)).toBe(true);
    if (isParserSuccess(result)) {
      throw new Error('expected parser error');
    }
    expect(result.expected).toEqual(['abc']);
    expect(result.got).toEqual('def');
    expect(result.grammar.meta).toEqual({regex: /abc/});
  });

});
