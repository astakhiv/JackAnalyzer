# JackAnalyzer

The Jack Analyzer in JS for [Hack architecture](https://en.wikipedia.org/wiki/Hack_computer), constructed during [Nand2Tetris part II course](https://www.coursera.org/learn/nand2tetris2)

## Project Structure

- `JackAnalyzer.js`
    - `main()` - orchestrates the analyzer.
    - `getWorkingPathAndType()` - detirmines from where to read source file/files and sets the type to `"dir"` or `"file"` respectively.  
    - `processDir(path)` - calles `processFile(path)` on every `.jack` file in `path`.
    - `processFile(path)` - reads file contents, calls `getTokentWithTypes(sourceCode)` and `tokensToXML(tokens)`, writes it to `(filename)T.xml`, `TODO`.
- `Tokenizer.js`
    - `getTokentWithTypes(sourceCode)` - processes inputed sourceCode and returns tokens is format: `[..., [token, type], ...]`.
    - `writeToTokens(tokens, token, type)` - writes to `tokens` a `[token, type]` pair.
    - `getTokenType(token)` - returns type, based on the `token`.
    - `tokensToXML(tokens)` - converts `tokens` of `[..., [token, type], ...]` format, into the following one:
    ```
    <token>
        ...
        <type>token</type>
        ...
    </token>
    ```
- `TokenizerHashes.js` - contains hashes for `Tokenizer.js` to use.
- `package.json` - enables ECMAScript modules.
