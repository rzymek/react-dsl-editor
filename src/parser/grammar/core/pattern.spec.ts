import {describe, expect, it} from 'vitest';
import {pattern} from './pattern';
import {isParserError, ParserContext} from '../../types';
import {strictInitialContext} from "./strictInitialContext";

describe('pattern suggestions', () => {
  it('should return suggestions', () => {
    const grammar = pattern(/[0-9]+/);
    const suggestions = grammar.suggestions();
    expect(suggestions.map(s => s.text)).toEqual(['0']);
  });
  it('suggestions return {text, node} objects', () => {
    const grammar = pattern(/[0-9]+/);
    const suggestions = grammar.suggestions();
    expect(suggestions[0]).toMatchObject({text: '0', node: grammar});
  });
  it('suggestions with dot',()=>{
    expect(pattern(/ab.cd/).suggestions().map(s => s.text)).toEqual(['ab cd']);
  });
  it('should reject non-matching input', () => {
    const grammar = pattern(/abc/);
    const result = grammar.parse('xyz', strictInitialContext as ParserContext<never>);
    expect(isParserError(result)).toBe(true);
    if (isParserError(result)) {
      expect(result.expected).toEqual(['/abc/']);
      expect(result.got).toEqual('xyz');
    }
  });
});
