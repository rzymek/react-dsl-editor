import { describe, it, expect } from 'vitest';
import { Parser, ParserResult } from './Parser';
import { funcParser } from '../example/funcParser';
import { projectDsl } from '../example/projectsDsl';
import dedent from "string-dedent"

function asText(result: ParserResult<string>): string {
  return result.terminals.map(it => it.text).join('');
}

describe('Parser', () => {
  it('should report unexpected trailing input as error (funcParser)', () => {
    // given
    const parser = new Parser(funcParser);
    // when
    const src = 'fun f1{1+1} fun f2{2';
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
  });
  it('should report unexpected trailing input as error (projectDsl)', () => {
    // given
    const parser = new Parser(projectDsl);
    // when
    const src = dedent`
      projects:
        p1
      dis
    `;
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
  });

  /*
  it.skip('y != x', () => {
    // given
    const parser = new Parser(repeat('repeat', sequence('seq', term('y'))));
    // when
    const result = parser.parse('x');
  });
  it('bar', () => {
    // given
    const parser = new Parser(funcParser);
    // when
    const result = parser.parse('fun f');
    // then
    expect(result.text).toEqual('fun f');
    expect(result.suggestions).not.toHaveLength(0);
  });

   */
});
