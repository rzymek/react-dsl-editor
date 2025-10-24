import { describe, expect, it } from 'vitest';
import { NodeTypes, Parse, Parser } from '../parser';
import { funcParser } from '../example/funcParser';
import { getSuggestions, suggestionsFromErrors } from './suggestions';

function testName(): string {
  return expect.getState().currentTestName!.replace(/^.*[>] /g, '');
}

function parseTestName<T extends string>(grammar: Parse<T>) {
  const input = testName();
  const cursorPositon = input.indexOf('|');
  const code = input.replace('|', '');
  const parser = new Parser(grammar);
  const ast = parser.parse(code);
  return {cursorPositon, ast};
}

describe('suggestionsFromErrors', () => {
  describe('should return all ast node types at position', () => {
    it('fun f1{1+1} f|', () => {
      // given
      const {ast, cursorPositon} = parseTestName(funcParser);
      // when
      const suggestions = suggestionsFromErrors(ast, cursorPositon);
      // then
      expect(suggestions).toEqual([
        {text: 'fun', type: 'fun'},
      ]);
    });
    it('f|u foo{2+2}', () => {
      // given
      const {ast, cursorPositon} = parseTestName(funcParser);
      // when
      const suggestions = suggestionsFromErrors(ast, cursorPositon);
      // then
      expect(suggestions).toEqual([
        {text: 'fun', type: 'fun'},
      ]);
    });
    it('fun b|', () => {
      // given
      function clientSuggestions(type: NodeTypes<typeof funcParser>) {
        if (type === 'identifier') {
          return ['foo', 'bar', 'baz'];
        } else if (type === 'optionalWhitespace') {
          return [];
        }
      }

      const {ast, cursorPositon} = parseTestName(funcParser);
      // when
      const suggestions = getSuggestions(ast, cursorPositon, clientSuggestions);
      // then
      expect(suggestions).toEqual([
        'bar', 'baz',
      ]);
    });
    it('fun b|ar {2+2}', () => {
      // given
      function clientSuggestions(type: NodeTypes<typeof funcParser>) {
        if (type === 'identifier') {
          return ['foo', 'bar', 'baz'];
        }
      }

      const {ast, cursorPositon} = parseTestName(funcParser);
      // when
      const suggestions = getSuggestions(ast, cursorPositon, clientSuggestions);
      // then
      expect(suggestions).toEqual([
        'bar', 'baz',
      ]);
    });

    it('fun foo{1+1} fun bar {2|', () => {
      // given
      function clientSuggestions(type: NodeTypes<typeof funcParser>) {
        if (type === 'rational') {
          return ['0'];
        }
      }

      const {ast, cursorPositon} = parseTestName(funcParser);
      // when
      const suggestions = getSuggestions(ast, cursorPositon, clientSuggestions);
      // then
      expect(suggestions).toEqual(expect.arrayContaining([
        '+', '0',
      ]));
    });
  });
});