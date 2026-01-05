import { error, GrammarNode, success } from '../../types';

export const eof: GrammarNode = {
  type: 'eof' as never,
  suggestions: () => [],
  children: [],
  parse(text: string) {
    if (text.length === 0) {
      return success({text, grammar: eof, children:[]});
    } else {
      return error({got: text, expected: [''], grammar: eof});
    }
  },
};

