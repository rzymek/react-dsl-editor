import { describe, expect, it } from 'vitest';
import { pattern } from './pattern';
import {asException, isParserError, ParserContext} from '../../types';
import {strictInitialContext} from "./strictInitialContext";

describe('pattern suggestions', () => {
  it('should return suggestions', () => {
    // given
    const grammar = pattern(/[0-9]+/);
    // when
    const suggestions = grammar.suggestions();
    // then
    expect(suggestions).toEqual(['0']);
  });
  it('partial match', () => {
    const grammar = pattern(/abcd/);
    const result = grammar.parse('ab xxx', strictInitialContext as ParserContext<never>);
    if (isParserError(result)) throw asException(result);
    expect(result.text).toEqual('ab');
  });
  it('partial match 2', () => {
    const grammar = pattern(/abcd/);
    const result = grammar.parse('ab', strictInitialContext as ParserContext<never>);
    if (isParserError(result)) throw asException(result);
    expect(result.text).toEqual('ab');
  });
  it('suggestions',()=>{
    expect(pattern(/ab.cd/).suggestions()).toEqual(['ab cd']);
  })
});
