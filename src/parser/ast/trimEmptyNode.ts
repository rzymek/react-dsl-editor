import { filter } from './filter';
import { isParserError, type ParserResult } from '../types';


export function trimEmptyNode<T extends string>(it:ParserResult<T>) {
  return filter(
    node => isParserError(node) || node.text !== '' || !!node.children,
    it
  );
}
