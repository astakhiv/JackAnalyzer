# CompilationEngine.js

- `compileFile(tokens)` - is exported for outer use
- `eat(token)` - helper method, parses `token` in `<type>token</type>` format.
- `indent(tabN, str)` - helper method, indents the `str` on new line by `tabN` tabs.
- `compileClass(tokens, i)`
- `compileVarDec(tokens, i, tabN, type)`
- `compileSubroutineDec(tokens, i, tabN)`
- `compileParameterList(tokens, i, tabN)`
- `compileSubroutineBody(tokens, i, tabN)`
- `compileStatements(tokens, i, tabN)`
- `compileLet(tokens, i, tabN)`
- `compileBlock(tokens, i, tabN)`
- `compileIf(tokens, i, tabN)`
- `compileWhile(tokens, i, tabN)`
- `compileDo(tokens, i, tabN)`
- `compileReturn(tokens, i, tabN)`
- `compileExpression(tokens, i, tabN)`
- `compileTerm(tokens, i, tabN)`
- `compileExpressionList(tokens, i, tabN)`

Each `compile` function respective Jack language structure (i. e. if, class, function, expression etc.).
All `compile` functions, except for `compileFile(tokens)` are local.

