export function shortcutName(e: React.KeyboardEvent<HTMLTextAreaElement>): string {
  let prefix = '';
  if (e.ctrlKey) {
    prefix = 'Ctrl';
  }
  let {key} = e;
  if (key === ' ') {
    key = 'Space';
  }
  return `${prefix}${key}`;
}