import { GrammarNode, isParserError, ParserSuccess, success } from '../../types';
import { defaultTo, map, only, pipe, take } from 'remeda';
import { recoverableError } from './recoverableErrorNode';

export function sequence<T extends string>(...nodes: GrammarNode<T>[]): GrammarNode<T> {
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
    parse(text, _context) {
      const context = {
        ..._context,
        depth: _context.depth + 1,
      }

      let offset = 0;
      const results: ParserSuccess<T>[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const rest = text.substring(offset);
        const result = node.parse(rest, context);
        if (isParserError(result)) {
          const faultToleranceMode = context.faultToleranceMode(grammar, context);
          if (faultToleranceMode !== 'none') {
            if (faultToleranceMode === 'skip-parser') {
              results.push(recoverableError('error:missing-input', ''));
            } else if (faultToleranceMode === 'skip-input') {
              const recovery = recoverableError<T>('error:unexpected-input', rest);
              results.push(recovery);
              offset += recovery.text.length;
              if (offset >= text.length) {
                return {...result, offset};
              }
              i--;
            }
            continue;
          }
          return {...result, offset};
        }
        offset += result.text.length;
        results.push(result);
      }
      return success({
        grammar: grammar,
        text: text.substring(0, offset),
        children: results,
      });
    },
  };
  return grammar;
}

