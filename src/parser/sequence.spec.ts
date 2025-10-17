import { sequence } from './sequence';
import { term } from './term';
import { isParserSuccess } from './types';
import { describe, it, expect } from 'vitest';

describe('sequence', () => {
  it('should parse a sequence of literals', () => {
    const parser = sequence('test', term('a'), term('b'), term('c'));
    const result = parser('abc');
    expect(isParserSuccess(result)).toBe(true);
    if (isParserSuccess(result)) {
      expect(result.text).toBe('abc');
      expect(result.children).toHaveLength(3);
    }
  });

  it('should return a recoverable error if one of the parsers fails', () => {
    const parser = sequence('test', term('a'), term('b'), term('c'));
    const result = parser('abd');
    expect(isParserSuccess(result)).toBe(true);
    if (isParserSuccess(result)) {
      expect(result.text).toBe('ab');
      expect(result.children).toHaveLength(3);
      expect(result.recoverableErrors).toHaveLength(1);
    }
  });

  it('should handle an empty input', () => {
    const parser = sequence('test', term('a'), term('b'));
    const result = parser('');
    expect(isParserSuccess(result)).toBe(true);
    if (isParserSuccess(result)) {
      expect(result.text).toBe('');
      expect(result.children).toHaveLength(2);
      expect(result.recoverableErrors).toHaveLength(2);
    }
  });

  it('should handle a sequence with a single parser', () => {
    const parser = sequence('test', term('a'));
    const result = parser('a');
    expect(isParserSuccess(result)).toBe(true);
    if (isParserSuccess(result)) {
      expect(result.text).toBe('a');
      expect(result.children).toHaveLength(1);
    }
  });

  it('should handle an empty sequence', () => {
    const parser = sequence('test');
    const result = parser('abc');
    expect(isParserSuccess(result)).toBe(true);
    if (isParserSuccess(result)) {
      expect(result.text).toBe('');
      expect(result.children).toHaveLength(0);
    }
  });
});
