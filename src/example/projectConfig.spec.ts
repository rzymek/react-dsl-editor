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
    const {result} = new Parser(projectDsl).parse(valid);
    expect.soft(visit(result, 'project')).toEqual(['p1', 'p2']);
    expect.soft(visit(result, 'display.total')).toEqual(['h.m']);
  });
});