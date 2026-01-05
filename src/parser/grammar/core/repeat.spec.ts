import { describe, expect, it } from 'vitest';
import { sequence } from './sequence';
import { repeat } from './repeat';

describe('repeat', () => {
  it('defaults', () => {
    const parser = repeat('repeat', term('.'));
    const ast = parser('....xx');
    expect(isParserSuccess(ast)).toBe(true);
    if (isParserSuccess(ast)) {
      expect(ast.text).toEqual('....');
    }
  });
  it('max', () => {
    const parser = repeat('repeat', term('.'), 1, 2);
    const ast = parser('....xx');
    expect(isParserSuccess(ast)).toBe(true);
    if (isParserSuccess(ast)) {
      expect(ast.text).toEqual('..');
    }
  });

  it('min', () => {
    const parser = repeat('repeat', term('.'), 3);
    const ast = parser('..xx');
    expect(isParserError(ast)).toBe(true);
    if (isParserError(ast)) {
      expect(ast).toEqual({
        offset: 0,
        expected: ['.'],
        got: 'xx',
        type: '.',
        parser: ast.parser,
      } satisfies ParserError<NodeTypes<typeof parser>>);
    }
  });
  it('repeat seq', () => {
    const parser = repeat('repeat', sequence('seq', term('y')));
    const ast = parser('x');
    expect(isParserError(ast)).toBe(true);
    if (isParserError(ast)) {
      expect(ast).toEqual({
        expected: 'y',
        got: 'x',
        offset: 0,
        type: 'y',
        parser: ast.parser,
      });
    }
  });
});
