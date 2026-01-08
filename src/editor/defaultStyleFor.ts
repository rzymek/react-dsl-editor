import { CSSProperties } from 'react';
import { CSTNode } from '../parser/CSTNode';

const colors: string[] = [
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
];

const colorAssignments = new Map<string, string>();

function getColorAssigment(value: unknown): string {
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

export function defaultStyleFor(node: CSTNode<string>): CSSProperties | undefined {
  const {name, regex} = node.grammar.meta ?? {};
  const value = name ?? regex;
  if (!value) {
    return undefined;
  }
  return {color: getColorAssigment(value)};
}