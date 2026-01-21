import {getSuggestions} from './getSuggestions';
import {describe, expect, it, vi} from 'vitest';
import {funcParser} from '../example/funcParser';
import {CSTOf, GrammarNode, NodeTypes} from '../parser/types';
import {DSLParser} from '../parser';
import {projectDsl} from "../example/projectsDsl";

const parser = new DSLParser(funcParser);

function funcSyntax(code: string) {
  return parser.parse(code).cst;
}

describe('getSuggestions', () => {
  it('should suggest the next missing term, without asking client', () => {
    const clientSuggestions = vi.fn();
    const suggestions = getSuggestions(funcSyntax(''), 0, clientSuggestions);
    expect(suggestions.map(it => it.suggestion)).toEqual(['fun']);
    expect(clientSuggestions).not.toHaveBeenCalled();//toHaveBeenCalledWith('keyword');
  });
  it('should ask for client suggestions and filter by prefix', () => {
    const code = 'fun b';
    const suggestions = getSuggestions(funcSyntax(code), code.length, node => {
      if (node.grammar.meta?.name === 'identifier') {
        return ['foo', 'bar', 'baz'];
      }
    });
    expect(suggestions.map(it => it.suggestion)).toContain('bar');
    expect(suggestions.map(it => it.suggestion)).toContain('baz');
  });
  it('should not suggest already completed suggestions', () => {
    const code = 'fun foo';
    const askedFor: string[] = [];
    const suggestions = getSuggestions(funcSyntax(code), code.length, node => {
      askedFor.push((node.grammar.meta?.name as string) ?? '-');
      if (node.grammar.meta?.name === 'identifier') {
        return ['foo', 'bar', 'baz'];
      }
    });
    expect(suggestions.map(it => it.suggestion)).toContain('{');
  });

});

describe('suggestions', () => {

  function testName(): string {
    return expect.getState().currentTestName!.replace(/^.*[>] /g, '');
  }

  function parseTestName<T extends string>(grammar: GrammarNode<T>) {
    const input = testName();
    const cursorPositon = input.indexOf('|');
    const code = input.replace('|', '');
    const parser = new DSLParser(grammar);
    const result = parser.parse(code);
    return {cursorPositon, ...result};
  }

  describe('suggestionsFromErrors', () => {
    describe.skip('should return all ast node types at position', () => {
      it('fun f1{1+1} f|', () => {
        // given
        const {cst, cursorPositon} = parseTestName(funcParser);
        // when
        const suggestions = getSuggestions(cst, cursorPositon);
        // then
        expect(suggestions).toEqual([
          {text: 'fun', type: 'fun'},
        ]);
      });
      it('f|u foo{2+2}', () => {
        // given
        const {cst, cursorPositon} = parseTestName(funcParser);
        // when
        const suggestions = getSuggestions(cst, cursorPositon);
        // then
        expect(suggestions).toEqual([
          {text: 'fun', type: 'fun'},
        ]);
      });
      it(`display:
          total: |
projects:
          proj1
          proj2`, () => {
        // given
        const {cst, cursorPositon} = parseTestName(projectDsl);
        // when
        const suggestions = getSuggestions(cst, cursorPositon);
        // then
        expect(suggestions).toEqual([
          {text: 'fun', type: 'fun'},
        ]);
      });
      it('fun b|', () => {
        // given
        function clientSuggestions(node: CSTOf<typeof funcParser>) {
          if (node.grammar.type === 'identifier') {
            return ['foo', 'bar', 'baz'];
          }
        }

        const {cst, cursorPositon} = parseTestName(funcParser);
        // when
        const suggestions = getSuggestions(cst, cursorPositon, clientSuggestions);
        // then
        expect(suggestions).toEqual([
          'bar', 'baz',
        ]);
      });
      it('fun b|ar {2+2}', () => {
        // given
        function clientSuggestions(node: CSTOf<typeof funcParser>) {
          if (node.grammar.type === 'identifier') {
            return ['foo', 'bar', 'baz'];
          }
        }

        const {cst, cursorPositon} = parseTestName(funcParser);
        // when
        const suggestions = getSuggestions(cst, cursorPositon, clientSuggestions);
        // then
        expect(suggestions).toEqual([
          'bar', 'baz',
        ]);
      });

      it('fun foo{1+1} fun bar {2|', () => {
        const {cst, cursorPositon} = parseTestName(funcParser);
        // when
        const suggestions = getSuggestions(cst, cursorPositon, node => {
          if (node.grammar.type === 'rational') {
            return ['0'];
          }
        });
        // then
        expect(suggestions).toEqual(expect.arrayContaining([
          '+', '0',
        ]));
      });
      it('display:\n total: |h:m', () => {
        const {cst, cursorPositon} = parseTestName(projectDsl);
        // when
        const suggestions = getSuggestions(cst, cursorPositon, () => undefined);
        // then
        expect(suggestions.map(it=>it.suggestion)).toEqual(expect.arrayContaining([
          "h:m","h.m"
        ]));
      });
    });
  });
});