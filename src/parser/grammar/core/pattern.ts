import RandExp from 'randexp';
import { filter, first, map, pipe, range, unique } from 'remeda';
import { error, GrammarNode, ParserResult, success } from '../../types';
import leven from 'leven';

export function pattern(regex: RegExp) {
  const rangexp = new RandExp(regex);
  rangexp.randInt = (min) => min;
  // rangexp.defaultRange.subtract(-Infinity, +Infinity);

  function suggestions() {
    return pipe(range(0, 10), map(() => rangexp.gen()), unique());
  }

  const grammar: GrammarNode = {
    type: 'pattern' as never,
    children: [],
    meta: {regex},
    suggestions,
    parse(text, context): ParserResult {
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
        if (context.faultToleranceMode === 'skip-parser1') {
          const fuzzyMatch = pipe(
            suggestions(),
            filter(s => leven(s, text) <= 2),
            first(),
          );
          if (fuzzyMatch !== undefined) {
            return success({
              text: text.substring(0, fuzzyMatch.length),
              grammar,
              children: [],
              recoverableError: true,
            });
          }
        }
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