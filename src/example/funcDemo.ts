import { funcParser } from './funcParser';

export function funcDemo() {
  return {
    grammar: funcParser,
    suggest(type: string) {
      if (type == 'keyword') {
        return ['fun'];
      } else if (type === 'identifier') {
        return ['foo', 'bar', 'baz'];
      } else if (type === 'space') {
        return [' '];
      } else if (type === 'rational') {
        return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
      }
    },
  };
}