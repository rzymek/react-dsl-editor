import { filter } from './filter.ts';
import { isParserSuccess } from '../types.ts';

export const trimEmptyNode =
  filter.bind(null, node => isParserSuccess(node) ? (node.text!=='' || !!node.children) : node.missing);