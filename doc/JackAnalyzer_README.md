# JackAnalyzer.js


- `main()` - orchestrates the analyzer.
- `getWorkingPathAndType()` - detirmines from where to read source file/files and sets the type to `"dir"` or `"file"` respectively.  
- `processDir(path)` - calles `processFile(path)` on every `.jack` file in `path`.
- `processFile(path)` - reads file contents, calls `getTokentWithTypes(sourceCode)` and `tokensToXML(tokens)`, writes result to `(filename)T.xml`, calls `compileFile(tokens)`, writes retult to `(filename).xml`.
