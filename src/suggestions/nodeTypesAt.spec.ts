import { describe, expect, it } from 'vitest';
import { NodeTypes, Parse, Parser } from '../parser';
import { funcParser } from '../example/funcParser';
import { nodeTypesAt } from './nodeTypesAt';

function testName(): string {
  return expect.getState().currentTestName!.replace(/^.*[>] /g, '');
}

function parseTestName(grammar: Parse<string>) {
  const input = testName();
  const cursorPositon = input.indexOf('|');
  const code = input.replace('|', '');
  const parser = new Parser(grammar);
  const ast = parser.parse(code);
  return {cursorPositon, ast};
}

describe('nodeTypesAt', () => {
  describe('should return all ast node types at position', () => {
    it('fun foo { 123  | + 34 }', () => {
      // given
      const {cursorPositon, ast} = parseTestName(funcParser);
      // when
      const nodes = nodeTypesAt(ast, cursorPositon);
      // then
      expect(nodes.map(it => it.type)).toEqual([
        'functions', 'func', 'expression', 'optionalWhitespace',
      ] satisfies NodeTypes<typeof funcParser>[]);
    });

    it('fun foo { 12|3  + 34 }', () => {
      // given
      const {cursorPositon, ast} = parseTestName(funcParser);
      // when
      const nodes = nodeTypesAt(ast, cursorPositon);
      // then
      expect(nodes.map(it => it.type)).toEqual([
        'functions', 'func', 'expression', 'rational',
      ] satisfies NodeTypes<typeof funcParser>[]);
    });

    it('fun fo|o { 123  + 34 }', () => {
      // given
      const {cursorPositon, ast} = parseTestName(funcParser);
      // when
      const nodes = nodeTypesAt(ast, cursorPositon);
      // then
      expect(nodes.map(it => it.type)).toEqual([
        'functions', 'func', 'identifier',
      ] satisfies NodeTypes<typeof funcParser>[]);
    });
  });

  it('fun fo|o { ', () => {
    // given
    const {cursorPositon, ast} = parseTestName(funcParser);
    // when
    const nodes = nodeTypesAt(ast, cursorPositon);
    // then
    expect(nodes.map(it => it.type)).toEqual([
      'functions', 'func', 'identifier',
    ] satisfies NodeTypes<typeof funcParser>[]);
  });

  it('fun foo { xx|x', () => {
    // given
    const {cursorPositon, ast} = parseTestName(funcParser);
    // when
    const nodes = nodeTypesAt(ast, cursorPositon);
    // then
    expect(nodes.map(it => it.type)).toEqual([] satisfies NodeTypes<typeof funcParser>[]);
  });

  it('fun foo {| xxx', () => {
    // given
    const {cursorPositon, ast} = parseTestName(funcParser);
    // when
    const nodes = nodeTypesAt(ast, cursorPositon);
    // then
    expect(nodes.map(it => it.type)).toEqual([
      'functions', 'func', '{',
    ] satisfies NodeTypes<typeof funcParser>[]);
  });

  it('fun foo|{2+2}', () => {
    // given
    const {cursorPositon, ast} = parseTestName(funcParser);
    // when
    const nodes = nodeTypesAt(ast, cursorPositon);
    // then
    expect(nodes.map(it => it.type)).toEqual([
      'functions', 'func', 'identifier',
    ] satisfies NodeTypes<typeof funcParser>[]);
  });
});