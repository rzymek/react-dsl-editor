import {CSSProperties} from 'react';
import {CSTNode} from '../parser/CSTNode';

const themes = {
  light: [
    '#FF0000',
    '#0000FF',
    '#FF00FF',
    '#800000',
    '#008000',
    '#000080',
    '#808000',
    '#800080',
    '#008080',
    '#808080',
    '#993366',
    '#336699',
  ] satisfies string[],
  dark: [
    '#FF5555',
    '#5555FF',
    '#FF55FF',
    '#FF5555',
    '#55FF55',
    '#5555FF',
    '#FFFF55',
    '#FF55FF',
    '#55FFFF',
    '#AAAAAA',
    '#CC99FF',
    '#99CCFF',
  ] satisfies string[],
} as const;

function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function getColorAssigment(value: unknown, colors: string[]): string {
  const key = String(value);
  const colorIndex = cyrb53(key) % colors.length;
  return colors[colorIndex];
}

function defaultStyleFor(node: CSTNode<string>, colors: string[]): CSSProperties | undefined {
  const {name, regex} = node.grammar.meta ?? {};
  const value = name ?? regex;
  if (!value) {
    return undefined;
  }
  return {color: getColorAssigment(value, colors)};
}

export function defaultSyntaxColors(theme: keyof typeof themes) {
  return (node: CSTNode<string>) => defaultStyleFor(node, themes[theme]);
}
