import { keywordHash, symbolHash } from "./TokenizerHashes.js";

export function getTokensWithTypes(sourceCode) {
    const tokens = [];

    let curToken = "";

    for (let i = 0; i < sourceCode.length; i++) {
        if (sourceCode[i] === "/" && (sourceCode[i+1] === "/" || sourceCode[i+1] === "*")) {
            while(sourceCode[i] !== "\n") {
                i++;
            }
        }
        
        if (sourceCode[i] === `"`) {
            writeToken(tokens, curToken, getTokenType(curToken));
            curToken = "";

            do {
                curToken += sourceCode[i++];
            } while(sourceCode[i] !== `"`)

            writeToken(tokens, curToken.slice(1), getTokenType(curToken));
            curToken = "";

            continue;
        }

        if (symbolHash[sourceCode[i]]) {
            writeToken(tokens, curToken, getTokenType(curToken));

            curToken = "";

            writeToken(tokens, symbolHash[sourceCode[i]], getTokenType(sourceCode[i]));

            continue;
        } 

        if ((sourceCode[i] === "\n" || sourceCode[i] === " ")) {
            writeToken(tokens, curToken, getTokenType(curToken));            

            curToken = "";
        }

        if (sourceCode[i] !== " " && sourceCode[i] !== "\t" && sourceCode[i] !== "\n") {
            curToken += sourceCode[i];
        }
    }

    return tokens;
}


function writeToken(tokens, token, type) {
    token = token.trim();

    if (token.length > 0) {
        tokens.push([token, type]);
    }
}

function getTokenType(token) {
    let ans = "";

    if (keywordHash[token] !== undefined) {
        ans = "keyword";
    } else if (symbolHash[token] !== undefined) {
        ans = "symbol";
    } else if (isNaN(token) === false) {
        ans = "integerConstant";
    } else if (token[0] === `"`) {
        ans = "stringConstant";
    } else {
        ans = "identifier";
    }

    return ans;
}

export function tokensToXML(tokens) {
    let XML = "<tokens>";
    
    for (let i = 0; i < tokens.length; i++) {
        XML += `\n\t<${tokens[i][1]}>${tokens[i][0]}</${tokens[i][1]}>`;
    }

    XML += "\n</tokens>";

    return XML;
}
