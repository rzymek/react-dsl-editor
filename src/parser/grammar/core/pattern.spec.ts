import { describe, expect, it } from 'vitest';
import { pattern } from './pattern';
import RandExp from 'randexp';

describe('pattern suggestions', () => {
  it('randexp', ()=>{
    const rangexp = new RandExp(/[a-z]+/);
    rangexp.randInt = () => 1;
    const gen = rangexp.gen();
    console.log(gen);
    expect(gen).not.toEqual('')
  });

  it('should return empty suggestions array', () => {
    // given
    const grammar = pattern(/[0-9]+/);
    // when
    const suggestions = grammar.suggestions();
    // then
    expect(suggestions).toEqual([]);
  });

});
