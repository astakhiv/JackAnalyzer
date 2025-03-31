# Tokenizer.js

- `getTokentWithTypes(sourceCode)` - processes inputed sourceCode and returns tokens is format: `[..., [token, type], ...]`.
- `writeToTokens(tokens, token, type)` - writes a `[token, type]` pair to `tokens`.
- `getTokenType(token)` - returns type, based on the `token`.
- `tokensToXML(tokens)` - converts `tokens` of `[..., [token, type], ...]` format, into the following one:
```
<token>
    ...
    <type>token</type>
    ...
</token>
```
