import RandExp from 'randexp';
import {map, pipe, range, unique} from 'remeda';
import {tap} from '../tap';
import {error, GrammarNode, ParserResult, success } from "../types";


export function pattern(regex: RegExp): GrammarNode<'pattern', ''>;
export function pattern<T>(regex: RegExp, type: T): GrammarNode<T, ''>
export function pattern<T extends string>(regex: RegExp, type: T = 'pattern' as T): GrammarNode<T, ''> {
  const grammar = {
    type: type,
    suggestions: () => {
      const rangexp = new RandExp(regex)
      rangexp.defaultRange.subtract(-Infinity, +Infinity)
      return pipe(range(0, 10), map(() => rangexp.gen()), unique());
    },
    parse: pattern
  }

  function pattern(text: string): ParserResult<T, ''> {
    tap(pattern, text);
    const re = new RegExp(regex, "yu");
    re.lastIndex = 0;
    const match = re.exec(text);
    if (match) {
      return success({
        text: match[0],
        grammar,
      });
    } else {
      const rangexp = new RandExp(regex);
      rangexp.defaultRange.subtract(-Infinity, +Infinity)
      return error({
        grammar,
        got: text,
        offset: 0,
        expected: grammar.suggestions(),
      });
    }
  }

  return {
    type: type,
    suggestions: () => {
      const rangexp = new RandExp(regex)
      rangexp.defaultRange.subtract(-Infinity, +Infinity)
      return pipe(range(0, 10), map(() => rangexp.gen()), unique());
    },
    parse: pattern
  };
}