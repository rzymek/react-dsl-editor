import { describe, expect, it } from 'vitest';
import { projectDsl } from './projectsDsl';
import dedent from 'string-dedent'
import { visit } from '../parser/visit';

describe('projectConfigDsl', () => {
  it('e2e',()=>{
    const valid = dedent`
      # comment
      projects:
        p1
        p2
      
      display:
        total: h.m
    `;
    const result = projectDsl.grammar(valid);
    expect(visit(result, node=> {
      if(node.type === 'projects') {
        return node;
      }
    })).toMatchSnapshot()
  })
});