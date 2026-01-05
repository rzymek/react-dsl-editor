import { assertType, expectTypeOf, test } from 'vitest';
import { named } from './named';
import { ws } from '../composite/ws';
import { GrammarNode } from '../../types';
import { seq } from '../composite/seq';
import { term } from '../composite/term';
import { sequence } from './sequence';

test('my types work properly', () => {
  assertType<GrammarNode<'custom'>>(named('custom', ws));
  assertType<GrammarNode<'custom'>>(named('custom', seq(term('x'))));
  const c = named('c', term('x'));
  const b = sequence(named('b', seq(c)));
  const abc = named('a', b);
  expectTypeOf(abc).toExtend<GrammarNode<'a' | 'b' | 'c'>>();
});