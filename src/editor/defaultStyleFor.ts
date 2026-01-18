import { CSSProperties } from 'react';
import { CSTNode } from '../parser/CSTNode';

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

const colorAssignments = new Map<string, string>();

function getColorAssigment(value: unknown, colors: string[]): string {
  const key = String(value);
  const color = colorAssignments.get(key);
  if (color) {
    return color;
  }
  const assignedColor = colors[colorAssignments.size % colors.length];
  colorAssignments.set(key, assignedColor);
  console.log(colorAssignments);
  return assignedColor;
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
