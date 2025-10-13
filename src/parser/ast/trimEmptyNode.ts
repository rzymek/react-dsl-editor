import { filter } from './filter.ts';
import { isParserError, type ParserResult } from '../types.ts';


export function trimEmptyNode<T extends string>(it:ParserResult<T>) {
  return filter(
    node => isParserError(node) || node.text !== '' || !!node.children,
    it
  );
}
