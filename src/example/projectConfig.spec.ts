import { describe, expect, it } from 'vitest';
import { projectDsl } from './projectsDsl';
import dedent from 'string-dedent';
import { visit } from '../parser/visit';
import { DSLParser } from '../parser';
import { cstPathAt } from './cstPathAt';

describe('projectConfigDsl', () => {
  it('e2e', () => {
    const valid = dedent`
      # comment
      projects:
        p1
        p|2
      
      display:
        total: h.m
    `;
    const input = valid.replace('|', '');
    const cursor = valid.indexOf('|');
    const {result, cst, terminals} = new DSLParser(projectDsl).parse(input);
    expect.soft(visit(result, 'project')).toEqual(['p1', 'p2']);
    expect.soft(visit(result, 'display.total')).toEqual(['h.m']);
    expect.soft(cstPathAt(cst, cursor).map(it => `${it.grammar.type} ${it.grammar.meta?.name ?? ''}`.trim())).toEqual([
      'sequence',
      'sequence',
      'repeat',
      'sequence',
      'repeat',
      'sequence',
      'named project',
      "pattern",
    ]);
    expect.soft(terminals.map(it=>it.text).join('')).toEqual(input);
    expect.soft(terminals.map(it=>it.text).join('')).toEqual(input);
  });
});