import { describe, expect, it } from 'vitest';
import { syntaxParser } from './syntaxParser.ts';
import { pattern } from '../parser/pattern.ts';
import { seq } from '../parser/seq.ts';
import { rational } from '../parser/rational.ts';
import { term } from '../parser/term.ts';
import { Parser } from '../parser/Parser.ts';

function funcParser() {
  const identifier = pattern(`[a-zA-Z_][a-zA-Z0-9_]*`, 'identifier');

  const expr = seq('expression',
    rational,
    term('+'),
    rational,
  );
  const func = seq('func',
    term('fun'), identifier, term('{'),
    expr,
    term('}'));
  return func;
}

describe('syntaxParser', () => {
  it('fun foo{10  +2}', () => {
    const parser = new Parser(funcParser());
    const currentTestName = expect.getState().currentTestName?.replace(/^.*[>] /g, '')!;
    const ast = parser.parse(currentTestName);
    const syntax = syntaxParser(ast);
    const expectedTokens = [
      'fun', ' ', 'foo', '{', '10', '  ', '+', '2', '}',
    ];
    expect(syntax.map(it => it.text)).toEqual(expectedTokens);
    expect(syntax.map(it => it.startOffset)).toEqual([
      0, 3, 4, 7, 8, 10, 12, 13, 14,
    ]);
    expect(syntax.map(it => it.endOffset)).toMatchInlineSnapshot([
      3, 4, 7, 8, 10, 12, 13, 14, 15,
    ]);
    expect(syntax.map(it => it.name)).toEqual([
      'term', 'optionalWhitespace', 'identifier', 'term', 'rational', 'optionalWhitespace', 'term', 'rational', 'term',
    ]);
  });
});