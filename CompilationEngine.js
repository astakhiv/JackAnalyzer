const classTemplate = [["class", "keyword"], ["", "identifier"], ["{", "symbol"], ["}", "symbol"]];
const varDec = [["", "keyword"], ["", "identifier"], ["", "identifier", "multPos"], [";", "symbol"]];
const subroutineDec = [["", "keyword"], ["", "identifier"], ["", "identifier"], ["(", "symbol"], ["", "params"], [")", "symbol"], ["{", "symbol"], ["}", "symbol"]];

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

function eat(token) {
    return `<${token[1]}> ${token[0]} </${token[1]}>`;
}

function compileClass(tokens, i) {
    let compileClassOutput = "<class>";

    for (let j = 0; j < classTemplate.length; j++, i++) {
        let outputData = "";
        switch(tokens[i][0]) {
            case "field":
                [outputData, i] = compileVarDec(tokens, i, varDec, 2, "classVarDec");
                j--;
                break;
            case "static":
                [outputData, i] = compileVarDec(tokens, i, varDec, 2, "classVarDec");
                j--;
                break;
            case "constructor":
            case "method":
            case "function":
                [outputData, i] = compileSubroutineDec(tokens, i, subroutineDec, 2);
                j--;
                break;
            default:
                outputData = eat(tokens[i]);
                break;
        }

        compileClassOutput += "\n\t" + outputData; 
    }

    return [compileClassOutput + "\n</class>", i]
}

function compileVarDec(tokens, i, compareTemp, tabN, type) {
    let compileClassVarDecOutput = `<${type}>`;
    
    for (let j = 0; j < compareTemp.length; j++, i++) {
        if (compareTemp[j].length === 3) {
            while(tokens[i][0] !== compareTemp[j+1][0]) {
                compileClassVarDecOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]); 
                i++;
            }

            j++;
        } else {
            compileClassVarDecOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]); 
        }    
    }

    compileClassVarDecOutput += "\n" + "\t".repeat(tabN) + eat([";", "symbol"]);

    return [compileClassVarDecOutput + `\n${("\t".repeat(tabN-1))}</${type}>`, --i];
}

function compileSubroutineDec(tokens, i, compareTemp, tabN) {
    let compileSubroutineDecOutput = "<subroutineDec>";

    for (let j = 0; j < compareTemp.length; j++, i++) {
        let outputData = "";
        console.log(tokens[i]);
        if (compareTemp[j][1] === "params") {
            [outputData, i] = compileParameterList(tokens, i, tabN+1); 
        } else if (compareTemp[j][0] === "{") {
            [outputData, i] = compileSubroutineBody(tokens, i, tabN+1);
        } else {
            outputData = eat(tokens[i]);
        }
        
        compileSubroutineDecOutput += "\n" + "\t".repeat(tabN) + outputData;
    }

    return [compileSubroutineDecOutput + `\n${("\t".repeat(tabN-1))}</subroutineDec>`, --i];
}

function compileParameterList(tokens, i, tabN) {
    let compileParameterListOutput = "<parameters>";

    while (tokens[i][0] !== ")") {
        compileParameterListOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
        i++;
    }

    return [compileParameterListOutput + `\n${("\t".repeat(tabN-1))}</parameters>`, --i];
}

function compileSubroutineBody(tokens, i, tabN) {
    let compileSubroutineBodyOutput = "<subroutineBody>";
    
    compileSubroutineBodyOutput += `\n${("\t".repeat(tabN))}` + eat(tokens[i++]);

    while(tokens[i][0] !== "}") {
        let outputData = "";
        if (tokens[i][0] === "var") {
            [outputData, i] = compileVarDec(tokens, i, varDec, "varDec");
        } else {
            [outputData, i] = compileStatements(tokens, i, tabN+1);
        }

        compileSubroutineBodyOutput += "\n" + "\t".repeat(tabN) + outputData;
        i++;
    }

    return [compileSubroutineBodyOutput + `\n${("\t".repeat(tabN-1))}</subroutineBody>`, --i];
}
function compileStatements(tokens, i, tabN) {
    let compileStatementsOutput = "<statements>";

    console.log("statements, tabN: " + tabN);

    return [compileStatementsOutput + `\n${("\t".repeat(tabN-1))}</statements>`, i];
}

// Handling statements
function compileLet() {}
function compileIf() {}
function compileWhile() {}
function compileDo() {}
function compileReturn() {}


// Handling exxpression
function compileExpression() {}
function compileTerm() {}
function compileExpressionList() {}
