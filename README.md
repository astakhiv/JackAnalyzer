# JackAnalyzer

The Jack Analyzer in JS for [Hack architecture](https://en.wikipedia.org/wiki/Hack_computer), constructed during [Nand2Tetris part II course](https://www.coursera.org/learn/nand2tetris2)

## Project Structure

- `JackAnalyzer.js`
    - `main()` - orchestrates the analyzer.
    - `getWorkingPathAndType()` - detirmines from where to read source file/files and sets the type to `"dir"` or `"file"` respectively.  
    - `processFile(path)` - `// TODO`
    - `processDir(path)` - calles `processFile(path)` on every `.jack` file in `path`
- `package.json` - enables ECMAScript modules
