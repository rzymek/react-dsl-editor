import { GrammarNode, isParserError, ParserSuccess, success } from '../../types';
import { defaultTo, map, only, pipe, take } from 'remeda';

export function sequence<T extends string>(...nodes: GrammarNode<T>[]):GrammarNode<T> {
  const grammar: GrammarNode<T> = {
    children: nodes,
    type: 'sequence' as T,
    suggestions() {
      return pipe(
        nodes,
        map(it => it.suggestions()),
        take(1),
        only(),
        defaultTo([]),
      );
    },
    parse(text, context) {
      let offset = 0;
      const results: ParserSuccess<T>[] = [];
      for (const node of nodes) {
        const rest = text.substring(offset);
        const result = node.parse(rest, context);
        if (isParserError(result)) {
          if (context.faultTolerant) {
            continue;
          }
          return result;
        }
        offset += result.text.length;
        results.push(result);
      }
      return success({
        grammar,
        text: text.substring(0, offset),
        children: results,
      });
    },
  };
  return grammar;
}
