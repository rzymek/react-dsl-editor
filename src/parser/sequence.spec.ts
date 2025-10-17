import { sequence } from './sequence';
import { term } from './term';
import { describe, expect, it } from 'vitest';

describe('sequence', () => {
  it('should parse a sequence of literals', () => {
    const parser = sequence('test', term('a'), term('b'), term('c'));
    const result = parser('abc');
    expect(result.text).toBe('abc');
    expect(result.errors).toEqual([]);
    expect(result.children).toEqual([
      {text: 'a', type: 'term', errors: []},
      {text: 'b', type: 'term', errors: []},
      {text: 'c', type: 'term', errors: []},
    ]);
  });

  it('should return a recoverable error if one of the parsers fails', () => {
    const parser = sequence('test', term('a'), term('b'), term('c'));
    const result = parser('abd');
    expect(result.text).toBe('ab');
    expect(result.children).toEqual([
      {text: 'a', type: 'term', errors: []},
      {text: 'b', type: 'term', errors: []},
      {
        text: '', type: 'term',
        errors: [{expected: 'c', got: 'd', offset: 2}],
      }]);
    expect(result.errors).toEqual([
      {expected: 'c', got: 'd', offset: 2},
    ]);
  });

  it('should handle an empty input', () => {
    const parser = sequence('test', term('a'), term('b'));
    const result = parser('');
    expect(result.text).toBe('');
    expect(result.children).toEqual([
      {text: '', type: 'term', errors: [{expected: 'a', got: '', offset: 0}]},
      {text: '', type: 'term', errors: [{expected: 'b', got: '', offset: 0}]},
    ]);
    expect(result.errors).toEqual([
      {expected: 'a', got: '', offset: 0},
      {expected: 'b', got: '', offset: 0},
    ]);
  });

  it('should handle a sequence with a single parser', () => {
    const parser = sequence('test', term('a'));
    const result = parser('a');
    expect(result.text).toBe('a');
    expect(result.errors).toEqual([]);
    expect(result.children).toEqual([
      {text: 'a', type: 'term', errors: []},
    ]);
  });

  it('should handle an empty sequence', () => {
    const parser = sequence('test');
    const result = parser('abc');
    expect(result.text).toBe('');
    expect(result.children).toEqual([]);
    expect(result.errors).toEqual([]);
  });
});
