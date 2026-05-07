import {describe, expect, it} from 'vitest';
import {displayConfig, projectDsl} from './projectsDsl';
import dedent from 'string-dedent';
import {visit} from '../parser/visit';
import {DSLParser, nodeName} from '../parser';
import {getSuggestions} from "../editor/getSuggestions";

describe('projectConfigDsl', () => {
  it('e2e', () => {
    const valid = dedent`
      projects:
        p1
        p|2
      time: h.m
    `;
    const input = valid.replace('|', '');
    const cursor = valid.indexOf('|');
    const dsl = new DSLParser(projectDsl).parse(input);
    const {result, cst, terminals} = dsl;
    const askedForSuggestionsOn: { name?: string, text: string }[] = [];
    getSuggestions(dsl, cursor, node => {
      askedForSuggestionsOn.push({name: nodeName(node), text: node.text})
      return undefined
    });
    expect.soft(visit(result, ['project'])).toEqual(['p1', 'p2']);
    expect.soft(visit(result, ['display.total'])).toEqual(['h.m']);
    expect.soft(terminals.map(it => it.text).join('')).toEqual(input);
    expect.soft(askedForSuggestionsOn).toEqual([{name: 'project', text: 'p2'}])
    expect.soft(result.errorLabel).toBeUndefined();
    void cst;
  });

  it('display error: missing value', () => {
    const src = 'time: \n';
    const dsl = new DSLParser(displayConfig).parse(src);
    expect.soft(dsl.errors[0]).toMatchObject({
      expected: ['/h:m/', '/h\\.m/'],
      start: 7,
      end: 8,
    });
  });
});
