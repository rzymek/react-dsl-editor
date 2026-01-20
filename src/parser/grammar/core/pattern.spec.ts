import { describe, expect, it } from 'vitest';
import { pattern } from './pattern';

describe('pattern suggestions', () => {
  it('should return empty suggestions array', () => {
    // given
    const grammar = pattern(/[0-9]+/);
    // when
    const suggestions = grammar.suggestions();
    // then
    expect(suggestions).toEqual([]);
  });

});
