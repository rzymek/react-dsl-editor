import RandExp from 'randexp';
import { map, pipe, range, unique } from 'remeda';
import { error, GrammarNode, ParserResult, success } from '../../types';

export function pattern(regex: RegExp) {
  const grammar:GrammarNode = {
    type: 'pattern' as never,
    children: [],
    suggestions: () => {
      const rangexp = new RandExp(regex);
      rangexp.defaultRange.subtract(-Infinity, +Infinity);
      return pipe(range(0, 10), map(() => rangexp.gen()), unique());
    },
    parse(text: string): ParserResult {
      const re = new RegExp(regex, 'yu');
      re.lastIndex = 0;
      const match = re.exec(text);
      if (match) {
        return success({
          text: match[0],
          grammar,
          children: [],
        });
      } else {
        const rangexp = new RandExp(regex);
        rangexp.defaultRange.subtract(-Infinity, +Infinity);
        return error({
          grammar,
          got: text,
          expected: grammar.suggestions(),
        });
      }
    },
  };
  return grammar;
}