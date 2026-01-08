import { describe, expect, it } from 'vitest';
import { sequence } from './grammar/core/sequence';
import { named } from './grammar/core/named';
import { pattern } from './grammar/core/pattern';
import { DSLParser } from './DSLParser';
import { visit } from './visit';
import { repeat } from './grammar/core/repeat';

describe('visit', () => {
  it('should extract named nodes', () => {
    const grammar = repeat(
      sequence(
        named('ax', pattern(/a./)),
        named('bx', pattern(/b./)),
      ));
    const {result} = new DSLParser(grammar).parse('a1b1a2b2');
    expect(visit(result, 'ax')).toEqual(['a1','a2']);
    expect(visit(result, 'bx')).toEqual(['b1','b2']);
  });
});