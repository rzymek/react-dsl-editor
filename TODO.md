* [ ] Pass styles of AST node types via JSS.  
  Typesafe: a record with typesafe keys of possible AST node types
* [ ] SyntaxHighligher: output parent AST nodes as well, to allow for styling not only terminals
* [ ] Pass parent AST node types to client suggestions function, not only terminals
* [x] Fix inserting suggestions, when the suggestion prefix is already in the text.   
  Now if the code is 'fun b| { 2 + 2}' (| is cursor position) and the suggestion "bar" is picked,  
  the result is 'fun bbar| { 2 + 2}', but should be 'fun bar| {2 + 2}'
* [ ] Add build in suggestions for RegEx terminals. E.g.:  
  `pattern(/\s+/, 'whitespace', ()=>[' '])`,  
  `pattern(/\d+/, 'number', ()=>_.range(0,10).map(it => it.toString()))`
* [ ] Suggest for the current node type as well as the next one is current is valid (check validity with parser combinator function)