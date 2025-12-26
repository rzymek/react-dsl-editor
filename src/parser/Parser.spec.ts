import { describe, it, expect } from 'vitest';
import { Parser } from './Parser';
import { funcParser } from '../example/funcParser';
import { NodeTypes, ParserError } from './types';
import { repeat } from './repeat';
import { term } from './term';
import { sequence } from './sequence';

describe('Parser', () => {
  it.skip('should report unexpected trailing input as error', () => {
    // given
    const parser = new Parser(funcParser);
    // when
    const result = parser.parse('fun f1{1+1} f');
    // then
    expect(result.errors).toEqual([{
      expected: '',
      got: 'f',
      offset: 12,
      type: 'error'
    }] satisfies ParserError<NodeTypes<typeof funcParser>>[]);
  });
  it.skip('y != x', () => {
    // given
    const parser = new Parser(repeat('repeat', sequence('seq', term('y'))));
    // when
    const result = parser.parse('x');
    // then
    expect(result.text).toEqual('');
    expect(result.errors).toEqual([{
      expected: '',
      got: 'x',
      offset: 0,
      type: 'error'
    }] satisfies ParserError<unknown>[]);
  });
  it('bar', () => {
    // given
    const parser = new Parser(funcParser);
    // when
    const result = parser.parse('fun f');
    // then
    expect(result.text).toEqual('fun f');
    expect(result.errors).not.toHaveLength(0);
  });
});
