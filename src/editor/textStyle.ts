import { CSSProperties } from 'react';

export const textStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  resize: 'none',

  position: 'absolute',
  inset: 0,
  overflow: 'auto',
  padding: 3,
  fontSize: '1em',
  lineHeight: '1.3em', // explicit line height required for cursor position calculation
  fontFamily: 'monospace',
};