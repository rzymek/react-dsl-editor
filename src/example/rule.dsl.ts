import {alternative, named, newline, pattern, repeat, sequence, term, ws} from "../parser";

const indent = pattern(/[ \t]+/);

export const rulesDsl =
  repeat(
    sequence(
      // RULE "Name"
      term('RULE'), ws, named('ruleName', pattern(/"[^"]+"/)), newline,

      // PRIORITY 75
      term('PRIORITY'), ws, named('priorityValue', pattern(/\d+/)), newline,

      // ON event_name
      term('ON'), ws, named('eventName', pattern(/[a-z_]+/i)), newline,

      // WHEN (Condition block)
      term('WHEN'), newline,
      repeat(
        sequence(
          indent,
          pattern(/[^.]+/),
          term('.'),
          pattern(/[a-z]+/),
          ws,
          alternative(
            term('>'),
            term('<'),
            term('in'),
          ),
          ws,
          pattern(/\[[^[]+\]/),
          newline
        )
      ),

      // THEN (Action block)
      term('THEN'), newline,
      repeat(
        sequence(
          indent,
          pattern(/[a-z]+/),
          ws,
          term('='),
          ws,
          pattern(/[0-9%]+/),
          newline
        )
      )
    )
  );
