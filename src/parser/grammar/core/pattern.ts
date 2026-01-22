import RandExp from 'randexp';
import {map, pipe, range, unique} from 'remeda';
import {GrammarNode, ParserResult, success} from '../../types';

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
        return context.handleTerminalError(text, context, grammar)
        // return error({
        //   path: context.path,,
        //   got: text,
        //   expected: grammar.suggestions(),
        //   offset: 0,
        // });
      }
    },
  };
  return grammar;
}