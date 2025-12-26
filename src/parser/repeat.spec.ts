import { describe, expect, it } from 'vitest';
import { repeat } from './repeat';
import { term } from './term';
import { isParserSuccess } from './types';
import { sequence } from './sequence';

describe('repeat', () => {
  it('defaults', () => {
    const parser = repeat('repeat', term('.'));
    const ast = parser('....xx');
    expect(isParserSuccess(ast)).toBe(true);
    expect(ast.text).toEqual('....');
    expect(ast.errors).toEqual([]);
  });
  it('max', () => {
    const parser = repeat('repeat', term('.'), 1, 2);
    const ast = parser('....xx');
    expect(isParserSuccess(ast)).toBe(true);
    expect(ast.text).toEqual('..');
    expect(ast.errors).toEqual([]);
  });

  it('min', () => {
    const parser = repeat('repeat', term('.'), 3);
    const ast = parser('..xx');
    expect(ast.text).toEqual('..');
    expect(ast.errors).toEqual([{
      expected: '.',
      got: 'xx',
      offset: 2,
      type: '.',
    }]);
  });
  it('repeat seq', () => {
    const parser = repeat('repeat', sequence('seq', term('y')));
    const ast = parser('x');
    expect(ast.text).toEqual('');
    expect(ast.errors).toEqual([{
      expected: 'y',
      got: 'x',
      offset: 0,
      type: "y",
    }]);
  });
});

