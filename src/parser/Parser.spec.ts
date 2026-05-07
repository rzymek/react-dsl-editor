import {describe, expect, it} from 'vitest';
import {DSL, DSLParser} from './DSLParser';
import {funcParser} from '../example/funcParser';
import {projectDsl} from '../example/projectsDsl';
import dedent from 'string-dedent';
import {named, nodeName, pattern, repeat, sequence} from './grammar/core';
import {optional, term} from './grammar/composite';
import {visitPredicate} from "./visit";
import {ParserSuccess} from "./types";
import {timesheetGrammar} from "../example/timesheet";

function asText(result: DSL<string>): string {
  return result.terminals.map(it => it.text).join('');
}

describe('Parser', () => {
  it('should report unexpected trailing input as error (funcParser)', () => {
    // given
    const parser = new DSLParser(funcParser);
    // when
    const src = 'fun f1{1+1} fun f2{2';
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
  });
  it('fun f1{1+1} f', () => {
    // given
    const parser = new DSLParser(funcParser);
    // when
    const src = 'fun f1{1+1} f';
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
  });
  it('abca',()=>{
    // given
    const parser = new DSLParser(repeat(term('abc')));
    // when
    const src = dedent`
      abcx



    `;
    const result = parser.parse(src);
    // then — parser consumes 'abc' and stops; trailing 'x\n...' is not consumed
    expect(asText(result)).toEqual('abc');
  });
  it('should report unexpected trailing input as error (projectDsl)', () => {
    // given
    const parser = new DSLParser(projectDsl);
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
  it('project config: projects only', () => {
    // given
    const parser = new DSLParser(projectDsl);
    // when
    const src = dedent`
      projects:
        proj1
        proj2
    `;
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
    expect(projectSettingsValues(result.result)).toEqual(dedent`
      project: proj1
      project: proj2
    `)
  });
  it('project config: display before projects', () => {
    // given
    const parser = new DSLParser(projectDsl);
    // when
    const src = dedent`
      time: h:m
      projects:
        proj1
        proj2
    `;
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
    expect(result.errors).toEqual([]);
    expect(projectSettingsValues(result.result)).toEqual(dedent`
      display.total: h:m
      project: proj1
      project: proj2
    `)
  });

  function projectSettingsValues(output: ParserSuccess<string>) {
    return visitPredicate(output, it => !!nodeName(it),
      it => `${nodeName(it)}: ${it.text}`)
      .join('\n')
  }
  it('project config: projects then display', () => {
    // given
    const parser = new DSLParser(projectDsl);
    // when
    const src = dedent`
      projects:
        proj1
      time: h:m
    `;
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
    expect(result.errors).toEqual([]);
    expect(projectSettingsValues(result.result)).toEqual(dedent`
      project: proj1
      display.total: h:m
    `)
  });

  it('project config: two projects then display', () => {
    // given
    const parser = new DSLParser(projectDsl);
    // when
    const src = dedent`
      projects:
        proj1
        proj2
      time: h:m
    `;
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
    expect(result.errors).toEqual([]);
    expect(projectSettingsValues(result.result)).toEqual(dedent`
      project: proj1
      project: proj2
      display.total: h:m
    `)
  });
  it('empty grammar', () => {
    // given
    const parser = new DSLParser(sequence());
    // when
    const result = parser.parse('anything here');
    // then — empty grammar matches nothing; parser returns empty string
    expect(asText(result)).toEqual('');
  });
  it('displ', () => {
    // given
    const parser = new DSLParser(projectDsl);
    // when
    const src = dedent`
      projects:
        proj1
        proj2
      displ
    `;
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
  });
  it('bar', async () => {
    // given
    const parser = new DSLParser(timesheetGrammar);
    // when
    const src = dedent`
      1 11:00-a-11:00
      2 10:00-a-11:00x
      
    `;
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
  });
  it('2', async () => {
    // given
    const parser = new DSLParser(timesheetGrammar);
    // when
    const src = dedent`
      1 00:01-a-00:02
      2 00:03-b-00:04x
      3 00:05-c-00:06
    `;
    const result = parser.parse(src);
    // then
    expect(asText(result)).toEqual(src);
  });
  it('1', async () => {
    // given
    const hour = pattern(/[0-9]{1,2}:[0-9]{2}/);
    const parser = new DSLParser(repeat(sequence(
        optional(pattern(/[ \t]/)),
        sequence(
          named('start', hour),
          term('-'),
          pattern(/[^-|]+/),
          term('-'),
        ),
        named('end', hour),
      ), 1),
    );
    // when
    const src = dedent`
      10:00-a-11:00x
    `;
    const result = parser.parse(src);

    // then — trailing 'x' is not consumed
    expect(asText(result)).toEqual('10:00-a-11:00');
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
