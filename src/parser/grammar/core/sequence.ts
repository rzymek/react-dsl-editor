import {error, GrammarNode, isParserError, ParserContext, ParserSuccess, success} from '../../types';

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
      const context:ParserContext<T> = {
        ..._context,
        path: [..._context.path, grammar],
      };

      let offset = 0;
      const results: ParserSuccess<T>[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const rest = text.substring(offset);
        const result = node.parse(rest, context);
        if (isParserError(result)) {
          return error({
            ...result,
            offset: result.offset + offset,
          });
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

