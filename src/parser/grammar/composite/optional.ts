import {GrammarNode} from '../../types';
import {repeat} from "../core/repeat";

export function optional<T extends string>(child: GrammarNode<T>) {
  return repeat(child,0,1)
}
// export function optional<T extends string>(child: GrammarNode<T>) {
//   const grammar: GrammarNode<T> = {
//     type: 'optional' as T,
//     suggestions: () => ['', ...child.suggestions()],
//     children: [child],
//     parse(text: string, _context: ParserContext<T>) {
//       const context:ParserContext<T> = {
//         ..._context,
//         path: [..._context.path, grammar],
//       };
//       const result = child.parse(text, context);
//       if (isParserError(result)) {
//         return success({text: '', grammar, children: []});
//       } else {
//         return result;
//       }
//     },
//   };
//   return grammar;
// }
