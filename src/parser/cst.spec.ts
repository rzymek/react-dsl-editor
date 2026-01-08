import { describe, expect, it } from 'vitest';
import { funcParser } from '../example/funcParser';
import { timesheet } from '../example/timesheet';
import { CSTNode } from './CSTNode';
import { GrammarNode } from './types';
import { DSLParser } from './DSLParser';

function testName() {
  return expect.getState().currentTestName!.replace(/^.*> /g, '');
}

function expectSyntaxTextToEqual(syntax: CSTNode<string>[], expected: unknown): void {
  expect(syntax.reduce((acc, it) => acc + it.text, '')).toEqual(expected);
}

function parseTestNameUsing(grammar: GrammarNode<string>) {
  const parser = new DSLParser(grammar);
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
    expect(syntax.terminals.map(it => it.grammar.type)).toEqual(expectedTokens.map(() => 'pattern'));
    expectSyntaxTextToEqual(syntax.terminals, testName());
  });

  it('fun foo{', () => {
    const syntax = parseTestName();
    expectSyntaxTextToEqual(syntax.terminals, testName());
  });

  it('fun foo{12 xx 34}', () => {
    const syntax = parseTestName();
    expectSyntaxTextToEqual(syntax.terminals, testName());
  });
  it('fun x yy', () => {
    const syntax = parseTestName();
    const input = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
    expect(syntax.cst.end).toEqual(input.length);
  });
  it('fun x', () => {
    const syntax = parseTestName();
    const input = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
  });
  it('fun x{1+1} fun y{2+', () => {
    const syntax = parseTestName();
    const input = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
  });
});

describe('timesheet syntax', () => {
  it('x', () => {
    const syntax = parseTestNameUsing(timesheet().grammar);
    const input = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
  });
  it('01.02.2024 11:11-', () => {
    const syntax = parseTestNameUsing(timesheet().grammar);
    const input = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
  });
  it('01.02', () => {
    const syntax = parseTestNameUsing(timesheet().grammar);
    const input = testName();
    expectSyntaxTextToEqual(syntax.terminals, input);
  });
  describe('parse as much as possible', () => {
    it('01.02.2024 11:11-project1-12:00-project2-12:0', () => {
      const syntax = parseTestNameUsing(timesheet().grammar);
      const input = testName();
      expectSyntaxTextToEqual(syntax.terminals, input);
      expect(syntax.cst.end).toEqual(input.length);
    });
  });
});