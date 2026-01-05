import { named } from './named';
import { describe, expect, it } from 'vitest';
import { anyBoolean, anyString } from 'any-toolkit-vitest';
import { pattern } from './pattern';
import { asException, isParserError } from '../../types';

describe('named', () => {
  it('should', () => {
    const name1 = anyString();
    const grammar = named(name1, pattern(/abc/));
    const result = grammar.parse('abc', {faultTolerant: anyBoolean()});
    if (isParserError(result)) {
      throw asException(result);
    }
    expect(result.grammar.type).toEqual(name1);
    expect(result.grammar.suggestions()).toEqual(['abc']);
    expect(result.text).toEqual('abc');
  });
});