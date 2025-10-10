import { filter } from './filter.ts';

export const trimEmptyNode = filter.bind(null, node => !!node.text);