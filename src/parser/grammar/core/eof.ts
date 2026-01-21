import {error, GrammarNode, success} from '../../types';

export const eof: GrammarNode = {
  type: 'eof' as never,
  suggestions: () => [],
  children: [],
  parse(text, context) {
    if (text.length === 0) {
      return success({text, grammar: eof, children: []});
    } else {
      if (context.faultToleranceMode(eof, context).includes('skip-input')) {
        return success({text, grammar: eof, children: [], recoverableError: true});
      }
      return error({got: text, expected: [''], grammar: eof, offset: 0});
    }
  },
};

