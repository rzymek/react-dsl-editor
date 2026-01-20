export function disjointIntervals<T extends { start: number, end: number }>(input: T[]): T[] {
  if (input.length === 0) return [];

  const sorted = [...input].sort((a, b) => a.start - b.start);
  const result: T[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = result[result.length - 1];

    if (current.start >= last.end) {
      result.push(current);
    } else {
      if (current.end > last.end) {
        result[result.length - 1] = {...last, end: current.end} as T;
      }
    }
  }

  return result;
}