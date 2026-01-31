import {describe, expect, it, vi} from 'vitest';
import {displayConfig, projectDsl} from './projectsDsl';
import dedent from 'string-dedent';
import { visit } from '../parser/visit';
import {DSLParser, nodeName} from '../parser';
import { cstPathAt } from './cstPathAt';
import {getSuggestions} from "../editor/getSuggestions";

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
    const askedForSuggestionsOn:{}[] = [];
    getSuggestions(cst, cursor, node => {
      askedForSuggestionsOn.push({name:nodeName(node), text: node.text})
      return undefined
    });
    expect.soft(visit(result, ['project'])).toEqual(['p1', 'p2']);
    expect.soft(visit(result, ['display.total'])).toEqual(['h.m']);
    expect.soft(terminals.map(it=>it.text).join('')).toEqual(input);
    expect.soft(terminals.map(it=>it.text).join('')).toEqual(input);
    expect.soft(askedForSuggestionsOn).toEqual([{name:'project',text:'p2'}])
    expect.soft(result.errorLabel).toBeUndefined();
  });

  it('display',()=>{
    const src = dedent`
      display:
        total: 
      projects:
    `
    const dsl = new DSLParser(displayConfig).parse(src)
    expect.soft(dsl.errors[0]).toEqual({
      message: "h:m or h.m expected",
      expected: [
        "h:m",
        "h.m"
      ],
      start: 18,
      end: 21,
      depth: 1
    });
  })
});