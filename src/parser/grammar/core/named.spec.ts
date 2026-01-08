import { named } from './named';
import { describe, expect, it } from 'vitest';
import { anyString } from 'any-toolkit-vitest';
import { pattern } from './pattern';
import { asException, isParserError, ParserContext } from '../../types';

const context: ParserContext = {
  faultTolerant: false,
  faultCorrection: it => it,
};

describe('named', () => {
  it('should', () => {
    const name = anyString();
    const grammar = named(name, pattern(/abc/));
    const result = grammar.parse('abc', context);
    if (isParserError(result)) {
      throw asException(result);
    }
    expect(result.grammar.meta?.name).toEqual(name);
    expect(result.grammar.suggestions()).toEqual(['abc']);
    expect(result.text).toEqual('abc');
  });
});