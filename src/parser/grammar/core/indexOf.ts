export function indexOf(text: string, needle: string, offset = 0) {
  const idx = text.indexOf(needle, offset);
  return (idx >= 0 ? idx : text.length);
}