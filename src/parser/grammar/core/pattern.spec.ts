import { describe, expect, it } from 'vitest';
import { pattern } from './pattern';
import { asException, isParserError } from '../../types';

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
    const result = grammar.parse('ab xxx', {depth: 1, faultToleranceMode: () => ['partial-match']});
    if (isParserError(result)) throw asException(result);
    expect(result.text).toEqual('ab');
    expect(result.recoverableError).toBe(true);
  });
  it('partial match 2', () => {
    const grammar = pattern(/abcd/);
    const result = grammar.parse('ab', {depth: 1, faultToleranceMode: () => ['partial-match']});
    if (isParserError(result)) throw asException(result);
    expect(result.text).toEqual('ab');
    expect(result.recoverableError).toBe(true);
  });
  it('suggestions',()=>{
    expect(pattern(/ab.cd/).suggestions()).toEqual(['ab cd']);
  })
});
