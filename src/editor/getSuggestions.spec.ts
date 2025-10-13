import { getSuggestions } from './getSuggestions';
import { describe, it, expect, vi } from 'vitest';
import { Parser } from '../parser/Parser.ts';
import { funcParser } from '../example/funcParser.ts';
import { textSyntax } from '../glue/textSyntax.ts';
import type { NodeTypes } from '../parser/types.ts';

const parser = new Parser(funcParser);

function funcSyntax(code: string) {
  return textSyntax(parser.parse(code), code);
}

describe('getSuggestions', () => {
  it('should suggest the next missing term, without asking client', () => {
    const clientSuggestions = vi.fn();
    const suggestions = getSuggestions(funcSyntax(''), 0, clientSuggestions);
    expect(suggestions).toEqual(['fun']);
    expect(clientSuggestions).not.toHaveBeenCalled();//toHaveBeenCalledWith('keyword');
  });
  it('should ask for client suggestions and filter by prefix', () => {
    const code = 'fun b';
    const suggestions = getSuggestions(funcSyntax(code), code.length, type => {
      if (type === 'identifier') {
        return ['foo', 'bar', 'baz'];
      }
    });
    expect(suggestions).toEqual(['bar','baz']);
  });
  it('should not suggest already completed suggestions', () => {
    const code = 'fun foo';
    const askedFor = [] as NodeTypes<typeof funcParser>[];
    const suggestions = getSuggestions(funcSyntax(code), code.length, type => {
      askedFor.push(type);
      if (type === 'identifier') {
        return ['foo', 'bar', 'baz'];
      }
    });
    expect(suggestions).toEqual(['{']);
    expect(askedFor).toEqual(['identifier'] satisfies NodeTypes<typeof funcParser>[]);
  });

});
