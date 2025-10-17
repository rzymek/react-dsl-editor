import { describe, it, expect } from 'vitest';
import { term } from './term';

describe('term', () => {
  it('should parse term', () => {
    const terminal = 'abc';
    const parser = term(terminal);
    expect(parser(terminal)).toEqual({type: 'term', text: terminal, errors: []});
  });

  it('should ignore extra', () => {
    const terminal = 'abc';
    const extra = 'def';
    const parser = term(terminal);
    expect(parser(terminal + extra)).toEqual({type: 'term', text: terminal, errors: []});
  });

  it('should reject not matching', () => {
    const terminal = 'abc';
    const other = 'def';
    const parser = term(terminal);
    expect(parser(other)).toEqual({
      type: 'term',
      text: '',
      errors: [{
        expected: 'abc',
        got: 'def',
        offset: 0,
      }],
    });
  });

});
