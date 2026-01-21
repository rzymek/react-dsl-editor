import {GrammarNode, isParserError, ParserSuccess, success} from '../../types';
import {recoverableError} from './recoverableErrorNode';

export function sequence<T extends string>(...nodes: GrammarNode<T>[]): GrammarNode<T> {
  const grammar: GrammarNode<T> = {
    children: nodes,
    type: 'sequence' as T,
    suggestions() {
      const result: string[] = [];
      for (const node of nodes) {
        const s = node.suggestions();
        result.push(...s.filter(it => it !== ''));
        if (!s.includes('')) {
          break;
        }
      }
      return result;
    },
    parse(text, _context) {
      const context = {
        ..._context,
        depth: _context.depth + 1,
      };

      let offset = 0;
      const results: ParserSuccess<T>[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const rest = text.substring(offset);
        const result = node.parse(rest, context);
        if (isParserError(result)) {
          const error = {...result, offset: result.offset + offset}
            const faultToleranceMode = context.faultToleranceMode(grammar, context);
            if (faultToleranceMode.includes('skip-parser')) {
              results.push(recoverableError(node.type, ''));
              continue;
            } else if (faultToleranceMode.includes('skip-input')) {
              const recovery = recoverableError<T>(node.type, rest);
              results.push(recovery);
              offset += recovery.text.length;
              if (offset >= text.length) {
                return error;
              }
              i--;
              continue;
            }
            return error;
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

