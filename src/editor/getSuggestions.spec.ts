import {getSuggestions} from './getSuggestions';
import {describe, expect, it} from 'vitest';
import {funcParser} from '../example/funcParser';
import {GrammarNode} from '../parser/types';
import {DSLParser, nodeName} from '../parser';
import {projectDsl} from "../example/projectsDsl";

describe('getSuggestions', () => {
  it('suggests matching term when cursor is inside partial prefix', () => {
    const dsl = new DSLParser(funcParser).parse('fu foo{2+2}');
    const suggestions = getSuggestions(dsl, 1);
    expect(suggestions.map(s => s.suggestion)).toContain('fun');
  });

  it('suggests grammar alternatives for named node', () => {
    const dsl = new DSLParser(projectDsl).parse('time: h:m');
    const suggestions = getSuggestions(dsl, 6);
    expect(suggestions.map(s => s.suggestion)).toEqual(['h:m', 'h.m']);
  });

  it('asks client for named nodes and filters by prefix', () => {
    const dsl = new DSLParser(projectDsl).parse('projects:\n  p2\n');
    const cursor = 'projects:\n  p'.length;
    const suggestions = getSuggestions(dsl, cursor, (node) => {
      if (nodeName(node) === 'project') return ['p1', 'p2', 'other'];
    });
    expect(suggestions.map(s => s.suggestion)).toContain('p1');
    expect(suggestions.map(s => s.suggestion)).toContain('p2');
    expect(suggestions.map(s => s.suggestion)).not.toContain('other');
  });

  it('returns SuggestionsResult with suggestion, prefix, node', () => {
    const dsl = new DSLParser(projectDsl).parse('time: h:m');
    const suggestions = getSuggestions(dsl, 6);
    const result = suggestions.find(s => s.suggestion === 'h:m');
    expect(result).toBeDefined();
    expect(result?.prefix).toBe('');
    expect(result?.node).toBeDefined();
  });
});

describe('suggestions with cursor position', () => {
  function parseTestName<T extends string>(grammar: GrammarNode<T>) {
    const input = expect.getState().currentTestName!.replace(/^.*[>] /g, '');
    const cursorPosition = input.indexOf('|');
    const code = input.replace('|', '');
    const dsl = new DSLParser(grammar).parse(code);
    return {cursorPosition, dsl};
  }

  it('f|u foo{2+2}', () => {
    const {dsl, cursorPosition} = parseTestName(funcParser);
    const suggestions = getSuggestions(dsl, cursorPosition);
    expect(suggestions.map(s => s.suggestion)).toContain('fun');
  });

  it('fun f1{1+1} f|', () => {
    const {dsl, cursorPosition} = parseTestName(funcParser);
    // cursor is past the partial match — error-recovery absorbs whole line, no prefix match
    const suggestions = getSuggestions(dsl, cursorPosition);
    expect(suggestions.map(s => s.suggestion)).not.toContain('{');
  });

  it('time: |h:m', () => {
    const {dsl, cursorPosition} = parseTestName(projectDsl);
    expect(getSuggestions(dsl, cursorPosition).map(s => s.suggestion)).toEqual(['h:m', 'h.m']);
  });

  it('time: h.|m', () => {
    const {dsl, cursorPosition} = parseTestName(projectDsl);
    const suggestions = getSuggestions(dsl, cursorPosition);
    expect(suggestions.map(s => s.suggestion)).toContain('h.m');
    expect(suggestions.map(s => s.suggestion)).not.toContain('h:m');
  });
});
