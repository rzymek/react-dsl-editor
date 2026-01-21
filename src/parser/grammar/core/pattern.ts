import RandExp from 'randexp';
import {firstBy, filter, first, map, pipe, range, unique} from 'remeda';
import {error, GrammarNode, ParserResult, success} from '../../types';
import leven from 'leven';

function getCommonPrefix(a: string, b: string): string {
  let i = 0;
  const minLength = Math.min(a.length, b.length);
  while (i < minLength && a[i] === b[i]) {
    i++;
  }
  return a.substring(0, i);
}

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
      console.log(regex, JSON.stringify({match, text}))
      if (match) {
        return success({
          text: match[0],
          grammar,
          children: [],
        });
      } else {
        const mode = context.faultToleranceMode(grammar, context);
        console.log(mode, regex, JSON.stringify(text));
        if (mode.includes('fuzzy-match')) {
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
        } else if (mode.includes('partial-match')) {
          const partial = pipe(
            suggestions(),
            map(s => getCommonPrefix(s, text)),
            filter(it => it.length > 0),
            firstBy(it => it.length),
          );
          if (partial) {
            return success({
              text: partial,
              grammar,
              children: [],
              recoverableError: true,
            });
          }
        }
        if (mode.includes("skip-parser")) {
          if (text.length === 0) {
            return success({
              text: '',
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
          offset: 0,
        });

      }
    },
  };
  return grammar;
}