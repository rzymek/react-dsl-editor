import { filter } from './filter.ts';
import { isParserError } from '../types.ts';

export const trimEmptyNode =
  filter.bind(null, node =>
    isParserError(node) || node.text !== '' || !!node.children,
  );