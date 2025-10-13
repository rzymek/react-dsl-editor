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
    if (isParserSuccess(ast)) {
      expect(ast.text).toEqual('....');
      expect(ast.recoverableErrors).toEqual([]);
    }
  });
  it('max', () => {
    const parser = repeat('repeat', term('.'), 1, 2);
    const ast = parser('....xx');
    expect(isParserSuccess(ast)).toBe(true);
    if (isParserSuccess(ast)) {
      expect(ast.text).toEqual('..');
      expect(ast.recoverableErrors).toEqual([]);
    }
  });

  it('min', () => {
    const parser = repeat('repeat', term('.'), 3);
    const ast = parser('..xx');
    expect(isParserSuccess(ast)).toBe(true);
    if (isParserSuccess(ast)) {
      expect(ast.text).toEqual('..');
      expect(ast.recoverableErrors).toEqual([{
        type: 'term',
        error: {
          expected: '.',
          got: 'xx',
          offset: 2,
        },
      }]);
    }
  });
  it('recovarableErrors', () => {
    const parser = repeat('repeat', sequence('seq', term('.')));
    const ast = parser('x');
    expect(isParserSuccess(ast)).toBe(true);
    if (isParserSuccess(ast)) {
      expect(ast.text).toEqual('');
      expect(ast.recoverableErrors).toEqual([{
        type: 'term',
        error: {
          expected: '.',
          got: 'x',
          offset: 0,
        },
      }]);
    }
  });

});

