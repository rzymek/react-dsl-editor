import { DSLError } from '../parser';
import { JSX,Fragment } from 'react';

export function decorateIntervals(errorIntervals: DSLError[], text: string, decorate: (text: string, error: DSLError) => JSX.Element): JSX.Element[] {
  const segments: JSX.Element[] = [];
  let lastEnd = 0;

  errorIntervals.forEach((error, index) => {
    // Add text before error
    if (error.start > lastEnd) {
      segments.push(<Fragment key={`text-${index}`}>{text.substring(lastEnd, error.start)}</Fragment>);
    }
    // Add error span
    segments.push(decorate(text.substring(error.start, error.end), error));
    lastEnd = error.end;
  });

  // Add remaining text after last error
  if (lastEnd < text.length) {
    segments.push(<Fragment key="text-end">{text.substring(lastEnd)}</Fragment>);
  }
  return segments;
}