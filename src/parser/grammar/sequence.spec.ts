import { sequence } from './sequence';
import { term } from './term';
import { describe, expect, it } from 'vitest';
import {
  asException,
  isParserError,
  isParserSuccess,
  NodeTypes,
  ParserError,
  ParserSuccess,
} from '../types';

describe('sequence', () => {
  it('should parse a sequence of literals', () => {
    const parser = sequence('test', term('a'), term('b'), term('c'));
    const result = parser('abc');
    if (isParserError(result)) throw asException(result);
    expect(result.text).toBe('abc');
    expect(result.children).toEqual([
      {text: 'a', type: 'a', parser: expect.anything()},
      {text: 'b', type: 'b', parser: expect.anything()},
      {text: 'c', type: 'c', parser: expect.anything()},
    ]);
  });

  it('should return a recoverable error if one of the parsers fails', () => {
    const parser = sequence('test', term('a'), term('b'), term('c'));
    const result = parser('abd');
    if (isParserSuccess(result)) throw new Error('Expected failure');
    expect(result).toEqual({
      expected: ['c'],
      got: 'd',
      offset: 0,
      type: 'c',
      parser: expect.anything(),
    } satisfies ParserError<NodeTypes<typeof parser>>);
  });

  it('should handle a sequence with a single parser', () => {
    const parser = sequence('test', term('a'));
    const result = parser('a');
    if (isParserError(result)) throw asException(result);
    expect(result.text).toBe('a');
    expect(result.children).toEqual([
      {text: 'a', type: 'a', parser: expect.anything()},
    ]);
  });

  it('should handle an empty sequence', () => {
    const parser = sequence('test');
    const result = parser('abc');
    if (isParserError(result)) throw asException(result);
    expect(result).toEqual({
      type: 'test',
      text: '',
      parser: expect.anything(),
      children: [],
    } satisfies ParserSuccess<NodeTypes<typeof parser>>);
  });
});
