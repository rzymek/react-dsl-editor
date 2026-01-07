import { CSSProperties } from 'react';
import { CSTNode } from '../parser';

const colors: string[] = [
  'red',
  'green',
  'blue'
  // '#191970',
  // '#006400',
  // '#8B0000',
  // '#4B0082',
  // '#8B4513',
  // '#2F4F4F',
  // '#800080',
  // '#008080',
  // '#556B2F',
  // '#8B008B',
  // '#A52A2A',
  // '#000080',
  // '#99004C',
  // '#008B8B',
  // '#333333',
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
  console.log(colorAssignments)
  return assignedColor;
}

export function defaultStyleFor(node: CSTNode<string>): CSSProperties | undefined {
  const {name, regex} = node.grammar.meta ?? {};
  const value = name ?? regex;
  if (!value) {
    return {color: 'black'};
  }
  return {color: getColorAssigment(value)};
}