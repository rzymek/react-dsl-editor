# React DSL Editor

Lightweight React textarea for Domain Specific Language (DSL) editing.

## Usage

```typescript jsx
// Define your grammar using the provided parser combinator library:
const identifier = pattern(`[a-zA-Z_][a-zA-Z0-9_]*`, 'identifier');
const grammar = sequence('declaration',
  term('var'),
  ws,
  identifier,
  term('='),
  rational,
);

// Optionally provide autocomplete suggestions for specific types of tokens:
function suggest(type: NodeTypes<typeof grammar>) {
  if(type === 'identifier') {
    return ['x', 'y', 'z'];
  }
}

function Usage() {
  const [code, setCode] = useState(`
    var x = 1.3
  `.trim());
  return <DslEditor grammar={grammar}
                    code={code}
                    onChange={setCode}
                    suggestions={suggest} />;
}

```
