import { repeat } from './repeat.ts';
import { term } from './term.ts';

export const ws = repeat('ws', term('space',' '))