import { DSLError } from '../parser';
import { JSX, Fragment } from 'react';

export function decorateIntervals(errorIntervals: DSLError[], text: string, decorate: (text: string, error: DSLError, index: number) => JSX.Element): JSX.Element[] {
  const segments: JSX.Element[] = [];
  let lastEnd = 0;

  errorIntervals.forEach((error, index) => {
    if (error.start > lastEnd) {
      segments.push(<Fragment key={`text-${index}`}>{text.substring(lastEnd, error.start)}</Fragment>);
    }
    segments.push(decorate(text.substring(error.start, error.end), error, index));
    lastEnd = error.end;
  });
  if (lastEnd < text.length) {
    segments.push(<Fragment key="text-end">{text.substring(lastEnd)}</Fragment>);
  }
  return segments;
}