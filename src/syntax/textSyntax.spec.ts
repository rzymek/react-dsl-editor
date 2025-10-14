import { describe, expect, it } from 'vitest';
import { textSyntax } from './textSyntax';
import { Parse, Parser } from '../parser';
import type { SyntaxElement } from '../editor/SyntaxHighlighter';
import { last } from 'remeda';
import { funcParser } from '../example/funcParser';
import { timesheet } from '../example/timesheet';

function testName(): string {
  return expect.getState().currentTestName!.replace(/^.*[>] /g, '');
}

function expectSyntaxTextToEqual(syntax: SyntaxElement<string>[], expected: string): void {
  expect(syntax.reduce((acc, it) => acc + it.text, '')).toEqual(expected);
}

function parseTestNameUsing(grammar: Parse<string>) {
  const parser = new Parser(grammar);
  const input = testName();
  const ast = parser.parse(input);
  return textSyntax(ast, input);
}

describe('func syntax', () => {
  function parseTestName() {
    return parseTestNameUsing(funcParser);
  }

  it('fun foo{10  +2}', () => {
    const syntax = parseTestName();
    const expectedTokens = [
      'fun', ' ', 'foo', '{', '10', '  ', '+', '2', '}',
    ];
    expect(syntax.map(it => it.text)).toEqual(expectedTokens);
    expect(syntax.map(it => it.startOffset)).toEqual([
      0, 3, 4, 7, 8, 10, 12, 13, 14,
    ]);
    expect(syntax.map(it => it.endOffset)).toEqual([
      3, 4, 7, 8, 10, 12, 13, 14, 15,
    ]);
    expect(syntax.map(it => it.name)).toEqual([
      'keyword', 'space', 'identifier', 'term', 'rational', 'optionalWhitespace', 'term', 'rational', 'term',
    ]);
    expectSyntaxTextToEqual(syntax, testName());
  });

  it('fun foo{', () => {
    const syntax = parseTestName();
    expect(syntax.map(it => it.name)).toEqual([
      'keyword', 'space', 'identifier', 'term', 'rational', 'term', 'rational', 'term',
    ]);
    expectSyntaxTextToEqual(syntax, testName());
  });

  it('fun foo{12 xx 34}', () => {
    const syntax = parseTestName();
    expectSyntaxTextToEqual(syntax, testName());
  });
  it('fun x yy', () => {
    const syntax = parseTestName();
    const input: string = testName();
    expectSyntaxTextToEqual(syntax, input);
    expect(last(syntax)).toEqual({
      name: 'error',
      text: 'yy',
      startOffset: 6,
      endOffset: 8,
    });
  });
  it('fun x', () => {
    const syntax = parseTestName();
    const input: string = testName();
    expectSyntaxTextToEqual(syntax, input);
  });
});

describe('timesheet syntax', () => {
  it('x', () => {
    const syntax = parseTestNameUsing(timesheet().grammar);
    const input: string = testName();
    expectSyntaxTextToEqual(syntax, input);
  });
  it('01.02.2024 11:11-',()=>{
    const syntax = parseTestNameUsing(timesheet().grammar);
    const input: string = testName();
    expectSyntaxTextToEqual(syntax, input);
  })
  it('01.02',()=>{
    const syntax = parseTestNameUsing(timesheet().grammar);
    const input: string = testName();
    expectSyntaxTextToEqual(syntax, input);
  })
});