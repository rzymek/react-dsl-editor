import { describe, expect, it } from 'vitest';
import { funcParser } from './funcParser';
import { cstPathAt } from './cstPathAt';
import { DSLParser, GrammarNode } from '../parser';

function testName(): string {
  return expect.getState().currentTestName!.replace(/^.*[>] /g, '');
}

function parseTestName(grammar: GrammarNode<string>) {
  const input = testName();
  const cursorPositon = input.indexOf('|');
  const code = input.replace('|', '');
  const parser = new DSLParser(grammar);
  const result = parser.parse(code);
  return {cursorPositon, ...result};
}

describe('cstPathAt', () => {
  describe('should return all ast node types at position', () => {
    it('fun foo { 123  | + 34 }', () => {
      // given
      const {cursorPositon, cst} = parseTestName(funcParser);
      // when
      const nodes = cstPathAt(cst, cursorPositon);
      // then
      expect(nodes.map(it => `[${it.grammar.type.padEnd(10,' ')}] ${it.text}`)).toMatchInlineSnapshot(`
        [
          "[sequence  ] fun foo { 123   + 34 }",
          "[repeat    ] fun foo { 123   + 34 }",
          "[sequence  ] fun foo { 123   + 34 }",
          "[sequence  ]  123   + 34 ",
          "[pattern   ]    ",
        ]
      `)
    });

    it('fun foo { 12|3  + 34 }', () => {
      // given
      const {cursorPositon, cst} = parseTestName(funcParser);
      // when
      const nodes = cstPathAt(cst, cursorPositon);
      // then
      expect(nodes.map(it => `[${it.grammar.type.padEnd(10,' ')}] ${it.text}`)).toMatchInlineSnapshot(`
        [
          "[sequence  ] fun foo { 123  + 34 }",
          "[repeat    ] fun foo { 123  + 34 }",
          "[sequence  ] fun foo { 123  + 34 }",
          "[sequence  ]  123  + 34 ",
          "[named     ] 123",
          "[pattern   ] 123",
        ]
      `)
    });

    it('fun fo|o { 123  + 34 }', () => {
      // given
      const {cursorPositon, cst} = parseTestName(funcParser);
      // when
      const nodes = cstPathAt(cst, cursorPositon);
      // then
      expect(nodes.map(it => `[${it.grammar.type.padEnd(10,' ')}] ${it.text}`)).toMatchInlineSnapshot(`
        [
          "[sequence  ] fun foo { 123  + 34 }",
          "[repeat    ] fun foo { 123  + 34 }",
          "[sequence  ] fun foo { 123  + 34 }",
          "[named     ] foo",
          "[pattern   ] foo",
        ]
      `)
    });
  });

  it('fun fo|o { ', () => {
    // given
    const {cursorPositon, cst} = parseTestName(funcParser);
    // when
    const nodes = cstPathAt(cst, cursorPositon);
    // then
    expect(nodes.map(it => `[${it.grammar.type.padEnd(10,' ')}] ${it.text}`)).toMatchInlineSnapshot(`
      [
        "[sequence  ] fun foo { ",
        "[repeat    ] fun foo { ",
        "[sequence  ] fun foo { ",
        "[named     ] foo",
        "[pattern   ] foo",
      ]
    `)
  });

  it('fun foo { xx|x', () => {
    // given
    const {cursorPositon, cst} = parseTestName(funcParser);
    // when
    const nodes = cstPathAt(cst, cursorPositon);
    // then
    expect(nodes.map(it => `[${it.grammar.type.padEnd(10,' ')}] ${it.text}`)).toMatchInlineSnapshot(`
      [
        "[sequence  ] fun foo { xxx",
        "[repeat    ] fun foo { xxx",
        "[sequence  ] xxx",
        "[named     ] xxx",
        "[pattern   ] xxx",
      ]
    `)
  });

  it('fun foo {| xxx', () => {
    // given
    const {cursorPositon, cst} = parseTestName(funcParser);
    // when
    const nodes = cstPathAt(cst, cursorPositon);
    // then
    expect(nodes.map(it => `[${it.grammar.type.padEnd(10,' ')}] ${it.text}`)).toMatchInlineSnapshot(`
      [
        "[sequence  ] fun foo { xxx",
        "[repeat    ] fun foo { xxx",
        "[sequence  ] fun foo { ",
        "[pattern   ] {",
        "[sequence  ]  ",
        "[pattern   ]  ",
      ]
    `)
  });

  it('fun foo|{2+2}', () => {
    // given
    const {cursorPositon, cst} = parseTestName(funcParser);
    // when
    const nodes = cstPathAt(cst, cursorPositon);
    // then
    expect(nodes.map(it => `[${it.grammar.type.padEnd(10,' ')}] ${it.text}`)).toMatchInlineSnapshot(`
      [
        "[sequence  ] fun foo{2+2}",
        "[repeat    ] fun foo{2+2}",
        "[sequence  ] fun foo{2+2}",
        "[named     ] foo",
        "[pattern   ] foo",
        "[optional  ] ",
        "[pattern   ] {",
      ]
    `)
  });
});