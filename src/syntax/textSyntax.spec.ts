import { describe, expect, it } from 'vitest';
import { last } from 'remeda';
import { funcParser } from '../example/funcParser';
import { timesheet } from '../example/timesheet';
import { CSTNode, Parser } from '../parser';
import { GrammarNode } from '../parser/types';

function testName(): string {
  return expect.getState().currentTestName!.replace(/^.*> /g, '');
}

function expectSyntaxTextToEqual(syntax: CSTNode<string>[], expected: string): void {
  expect(syntax.reduce((acc, it) => acc + it.text, '')).toEqual(expected);
}

function parseTestNameUsing(grammar: GrammarNode<string>) {
  const parser = new Parser(grammar);
  const input = testName();
  return parser.parse(input);
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
    expect(syntax.terminals.map(it => it.text)).toEqual(expectedTokens);
    expect(syntax.terminals.map(it => it.offset)).toEqual([
      0, 3, 4, 7, 8, 10, 12, 13, 14,
    ]);
    expect(syntax.terminals.map(it => it.grammar.type)).toEqual([
      'fun', 'space', 'identifier', '{', 'rational', 'optionalWhitespace', '+', 'rational', '}',
    ]);
    expectSyntaxTextToEqual(syntax.terminals, testName());
  });

  it('fun foo{', () => {
    const syntax = parseTestName();
    expect(syntax.terminals.map(it => it.grammar.type)).toEqual([
      'fun', 'space', 'identifier', '{',
    ]);
    expectSyntaxTextToEqual(syntax.terminals, testName());
  });

  it('fun foo{12 xx 34}', () => {
    const syntax = parseTestName();
    expectSyntaxTextToEqual(syntax.terminals, testName());
  });
  it('fun x yy', () => {
    const syntax = parseTestName();
    const input: string = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
    expect(last(syntax.terminals)).toEqual({
      name: 'error',
      text: 'yy',
      startOffset: 6,
    });
  });
  it('fun x', () => {
    const syntax = parseTestName();
    const input: string = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
  });
  it('fun x{1+1} fun y{2+', () => {
    const syntax = parseTestName();
    const input: string = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
  });
});

describe('timesheet syntax', () => {
  it('x', () => {
    const syntax = parseTestNameUsing(timesheet().grammar);
    const input: string = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
  });
  it('01.02.2024 11:11-', () => {
    const syntax = parseTestNameUsing(timesheet().grammar);
    const input: string = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
  });
  it('01.02', () => {
    const syntax = parseTestNameUsing(timesheet().grammar);
    const input: string = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
  });
  describe('parse as much as possible', () => {
    it('01.02.2024 11:11-project1-12:00-project2-12:0', () => {
      const syntax = parseTestNameUsing(timesheet().grammar);
      const input: string = testName();
      expectSyntaxTextToEqual(syntax.terminals, input);
      expect(syntax.terminals.map(it => it.grammar.type)).toMatchInlineSnapshot(`
        [
          "day",
          ".",
          "month",
          ".",
          "year",
          "space",
          "hour",
          "-",
          "project",
          "-",
          "hour",
          "-",
          "project",
          "-",
          "error",
        ]
      `);
    });
  });
});