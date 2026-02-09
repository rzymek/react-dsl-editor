import {firstBy, map, pipe} from "remeda";
import {GrammarNode, isParserError, isParserSuccess, ParserContext, ParserSuccess, success} from '../../types';
import {pickFromErrorLabels} from "./pickFromErrorLabels";

export function anyOrder<T extends string>(...nodes: GrammarNode<T>[]): GrammarNode<T> {
  const grammar: GrammarNode<T> = {
    children: nodes,
    type: 'sequence' as T,
    suggestions() {
      return nodes.flatMap(node => node.suggestions());
    },
    parse(text, _context) {
      const context: ParserContext<T> = {
        ..._context,
        path: [..._context.path, grammar],
      };

      let offset = 0;
      const results: ParserSuccess<T>[] = [];
      const set = new Set(nodes);
      for (let i = 0; i < nodes.length && set.size > 0 && text.length > 0; i++) {
        const rest = text.substring(offset);
        const bestMatch = pipe(
          Array.from(set),
          map(node => ({
            node,
            result: node.parse(rest, context)
          })),
          firstBy(it => isParserSuccess(it.result) ? (it.result.errorLabel?.got.length ?? 0) : Infinity)
        );
        if (!bestMatch || isParserError(bestMatch.result)) {
          break;
        }
        set.delete(bestMatch.node);
        results.push(bestMatch.result);
        offset += bestMatch.result.text.length;
      }
      return success({
        grammar,
        text: text.substring(0, offset),
        children: results,
        errorLabel: pickFromErrorLabels(results)?.errorLabel
      });
    },
  };
  return grammar;
}

