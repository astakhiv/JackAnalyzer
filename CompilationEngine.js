const classTemplate = [["class", "keyword"], ["", "identifier"], ["{", "symbol"], ["}", "symbol"]];
const classFieldVarDec = [["field", "keyword"], ["", "identifier"], ["", "identifier"], [";", "symbol"]];
const classStaticVarDec = [["static", "keyword"], ["", "identifier"], ["", "identifier"], [";", "symbol"]];

export function compileFile(tokens) {
    let compilerOutput = "";

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i][0] === "class") {
            [compilerOutput, i] = compileClass(tokens, i);
        }
    }
    
    console.log(compilerOutput);

    return compilerOutput;
}

function compileClass(tokens, i) {
    let compileClassOutput = "<class>";

    for (let j = 0; j < classTemplate.length; j++, i++) {
        let outputData = "";
        switch(tokens[i][0]) {
            case "field":
                [outputData, i] = compileClassVarDec(tokens, i, classFieldVarDec, 2);
                j--;
                break;
            case "static":
                [outputData, i] = compileClassVarDec(tokens, i, classStaticVarDec, 2);
                j--;
                break;
            case "constructor":
                break;
            case "method":
                break;
            case "function":
                break;
            default:
                outputData = eat(tokens[i]);
                break;
        }

        compileClassOutput += "\n\t" + outputData; 
    }

    return [compileClassOutput + "\n</class>", i]
}

function compileClassVarDec(tokens, i, compareTemp, tabN) {
    let compileClassVarDecOutput = "<classVarDec>";
    
    while (tokens[i][0] !== ";") { 
        compileClassVarDecOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]); 
        i++;
    }
    
    compileClassVarDecOutput += "\n" + "\t".repeat(tabN) + eat([";", "symbol"]);

    return [compileClassVarDecOutput + `\n${("\t".repeat(tabN-1))}</classVarDec>`, i];
}

function compileSubroutineDec(tokens, i, compareTemp, tabN) {
    let compileSubroutineDecOutput = "<subroutineDec>";

    for (let j = 0; j < compareTemp.length; j++) {
        compileSubroutineDecOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
    }

    return [compileSubroutineDecOutput + `\n${("\t".repeat(tabN-1))}</subroutineDec>`, i];
}

function compileParameterList() {}
function compileSubroutineBody() {}
function compileVarDec() {}
function compileStatements() {}

function eat(token) {
    return `<${token[1]}> ${token[0]} </${token[1]}>`;
}
