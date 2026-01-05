import { describe, expect, it } from 'vitest';
import { projectDsl } from './projectsDsl';
import dedent from 'string-dedent';
import { visit } from '../parser/visit';
import { Parser } from '../parser';

describe('projectConfigDsl', () => {
  it('e2e', () => {
    const valid = dedent`
      # comment
      projects:
        p1
        p2
      
      display:
        total: h.m
      
    `;
    const result = new Parser(projectDsl.grammar).parse(valid);
    expect(result.suggestions).toEqual([]);
    expect(visit(result, node => {
      if (node.type === 'projectName') {
        return node.text;
      }
    })).toEqual(['p1', 'p2']);

    expect(visit(result, node => {
      if (node.type === 'totalDisplay') {
        return node.children![0].text
      }
    })).toEqual(['h.m']);
  });
});