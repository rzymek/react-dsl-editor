import { pattern } from '../core/pattern';

export function term(str: string) {
  return pattern(new RegExp(regexEscape(str)));
}

function regexEscape(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
