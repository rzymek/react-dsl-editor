import { describe, expect, it } from 'vitest';
import { syntaxParser } from './syntaxParser.ts';
import { pattern } from '../parser/pattern.ts';
import { seq } from '../parser/seq.ts';
import { rational } from '../parser/rational.ts';
import { term } from '../parser/term.ts';
import { Parser } from '../parser/Parser.ts';
import type { SyntaxElement } from '../editor/CustomSyntaxHighlighter.tsx';

function funcParser() {
  const identifier = pattern(`[a-zA-Z_][a-zA-Z0-9_]*`, 'identifier');
  const keyword = term.bind(null,'keyword');
  const expr = seq('expression',
    rational,
    term('+'),
    rational,
  );
  const func = seq('func',
    keyword('fun'), identifier, term('{'),
    expr,
    term('}'));
  return func;
}

function parseTestName(): SyntaxElement[] {
  const parser = new Parser(funcParser());
  const currentTestName = expect.getState().currentTestName?.replace(/^.*[>] /g, '')!;
  const ast = parser.parse(currentTestName);
  return syntaxParser(ast);
}

describe('syntaxParser', () => {
  it('fun foo{10  +2}', () => {
    const syntax = parseTestName();
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
      'keyword', 'optionalWhitespace', 'identifier', 'term', 'rational', 'optionalWhitespace', 'term', 'rational', 'term',
    ]);
  });
  it('fun foo{', () => {
    const syntax = parseTestName();
    expect(syntax.map(it => it.name)).toEqual([
      'keyword', 'optionalWhitespace', 'identifier', 'term', 'rational', 'term', 'rational', 'term',
    ]);
  });
});