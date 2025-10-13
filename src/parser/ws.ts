import { repeat } from './repeat';
import { term } from './term';

export const ws = repeat('ws', term('space',' '))