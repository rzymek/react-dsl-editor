let limit = 500;

export function tap(parser: (test: string) => unknown, text: string): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const type = (parser as any).type;
  console.log(`${parser.name} ${type ? JSON.stringify(type) : ''}:`, JSON.stringify(text));
  if (--limit < 0) {
    throw new Error('loop');
  }
}