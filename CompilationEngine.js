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


const classTemplate = [["class", "keyword"], ["", "identifier"], ["{", "symbol"], ["}", "symbol"]];

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
                [outputData, i] = compileSubroutineDec(tokens, i, 2);
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


const varDec = [["", "keyword"], ["", "identifier"], ["", "list"], [";", "symbol"]];

function compileVarDec(tokens, i, compareTemp, tabN, type) {
    let compileClassVarDecOutput = `<${type}>`;
    
    for (let j = 0; j < compareTemp.length; j++, i++) {
        if (compareTemp[j][1] === "list") {
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


const subroutineDec = [["", "keyword"], ["", "identifier"], ["", "identifier"], ["(", "symbol"], ["", "list"], [")", "symbol"], ["{", "symbol"], ["}", "symbol"]];

function compileSubroutineDec(tokens, i, tabN) {
    let compileSubroutineDecOutput = "<subroutineDec>";
    const compareTemp = subroutineDec;

    for (let j = 0; j < compareTemp.length; j++, i++) {
        let outputData = "";
        console.log(tokens[i]);
        if (compareTemp[j][1] === "list") {
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

    statementsLoop: while (true) {
        let outputData = "";

        switch (tokens[i][0]) {
            case "let":
                [outputData, i] = compileLet(tokens, i, tabN+1);
                break;
            case "if":
                [outputData, i] = compileIf(tokens, i, tabN+1);
                break;
            case "while":
                [outputData, i] = compileWhile(tokens, i, tabN+1);
                break;
            case "do":
                [outputData, i] = compileDo(tokens, i, tabN+1);
                break;
            case "return":
                [outputData, i] = compileReturn(tokens, i, tabN+1);
                break;
            default:
                break statementsLoop;
        }
        
        compileStatementsOutput += "\n" + "\t".repeat(tabN) + outputData;
        i++;
    }

    return [compileStatementsOutput + `\n${("\t".repeat(tabN-1))}</statements>`, i];
}

// Handling statements

const letStatement = [["let", "keyword"], ["", "identifier"], ["=", "symbol"], ["", "expression"], [";", "symbol"]];
function compileLet(tokens, i, tabN) {
    const compareTemp = letStatement;
    let compileLetOutput = "<letStatement>";

    for (let j = 0; j < compareTemp.length; j++, i++) {
        if (compareTemp[j][1] === "expression") {
            while (tokens[i][0] !== compareTemp[j+1][0]) {
                i++;
            }
            compileLetOutput += "\n" + "\t".repeat(tabN) + ":) exprextion :)"; 
            compileLetOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
        } else {
            compileLetOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
        }
    }

    return [compileLetOutput + `\n${("\t".repeat(tabN-1))}</letStatement>`, i];
}


const ifStatement = [["if", "keyword"], ["(", "symbol"], ["", "expression"], [")", "symbol"], ["{", "symbol"], ["", "statements"], ["}", "symbol"]];

function compileIf(tokens, i, tabN) {
    const compareTemp = ifStatement;
    let compileIfOutput = "<ifStatement>";
   

    for (let j = 0; j < compareTemp.length; j++, i++) {
        let outputData = "";

        if (compareTemp[j][1] === "expression") {
            while (tokens[i][0] !== compareTemp[j+1][0]) {
                i++;
            }
            outputData += ":) exprextion :)"; 
            outputData += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
            j++;
        } else if (compareTemp[j][1] === "statements") {
            outputData += compileStatements(tokens, i, tabN+1);
            outputData += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
        } else {
            outputData += eat(tokens[i]);
        }

        compileIfOutput += "\n" + "\t".repeat(tabN) + outputData;
    }

    return [compileIfOutput + `\n${("\t".repeat(tabN-1))}</ifStatement>`, i];
}


const whileStatement = [];

function compileWhile(tokens, i, tabN) {
    const compareTemp = whileStatement;

    let compileWhileOutput = "<whileStatement>";

    return [compileWhileOutput + `\n${("\t".repeat(tabN-1))}</whileStatement>`, i];
}


const doStatement = [];

function compileDo(tokens, i, tabN) {
    const compareTemp = doStatement;

    let compileDoOutput = "<doStatement>";

    return [compileDoOutput + `\n${("\t".repeat(tabN-1))}</doStatement>`, i];
}


const returnStatement = [];

function compileReturn(tokens, i, tabN) {
    const compareTemp = returnStatement;

    let compileReturnOutput = "<returnStatement>";

    return [compileReturnOutput + `\n${("\t".repeat(tabN-1))}</returnStatement>`, i];
}


// Handling expression
function compileExpression() {}
function compileTerm() {}
function compileExpressionList() {}
