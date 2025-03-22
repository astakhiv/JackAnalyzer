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
                [outputData, i] = compileVarDec(tokens, i, varDec, "classVarDec", 2);
                j--;
                break;
            case "static":
                [outputData, i] = compileVarDec(tokens, i, varDec, "classVarDec", 2);
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

function compileVarDec(tokens, i, compareTemp, type, tabN) {
    let compileClassVarDecOutput = `<${type}>`;
    
    console.log(type, tokens[i], i);
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

    console.log(type, tokens[i], i);
    return [compileClassVarDecOutput + `\n${("\t".repeat(tabN-1))}</${type}>`, --i];
}


const subroutineDec = [["", "keyword"], ["", "identifier"], ["", "identifier"], ["(", "symbol"], ["parameters", "list"], [")", "symbol"], ["{", "symbol"], ["}", "symbol"]];

function compileSubroutineDec(tokens, i, tabN) {
    let compileSubroutineDecOutput = "<subroutineDec>";
    const compareTemp = subroutineDec;

    for (let j = 0; j < compareTemp.length; j++, i++) {
        let outputData = "";
        if (compareTemp[j][1] === "list") {
            [outputData, i] = compileList(tokens, i, compareTemp[j][0], tabN+1); 
        } else if (compareTemp[j][0] === "{") {
            [outputData, i] = compileSubroutineBody(tokens, i, tabN+1);
            j++;
        } else {
            outputData = eat(tokens[i]);
        }
        
        compileSubroutineDecOutput += "\n" + "\t".repeat(tabN) + outputData;
    }

    return [compileSubroutineDecOutput + `\n${("\t".repeat(tabN-1))}</subroutineDec>`, --i];
}

function compileList(tokens, i, listName, tabN) {
    let compileListOutput = `<${listName}>`;

    while (tokens[i][0] !== ")") {
        compileListOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
        i++;
    }

    return [compileListOutput + `\n${("\t".repeat(tabN-1))}</${listName}>`, --i];
}

function compileSubroutineBody(tokens, i, tabN) {
    let compileSubroutineBodyOutput = "<subroutineBody>";
    
    compileSubroutineBodyOutput += `\n${("\t".repeat(tabN))}` + eat(tokens[i++]);
    
    while(tokens[i][0] !== "}") {
        let outputData = "";
        if (tokens[i][0] === "var") {
            [outputData, i] = compileVarDec(tokens, i, varDec, "varDec", tabN+1);
        } else {
            [outputData, i] = compileStatements(tokens, i, tabN+1);
        }

        compileSubroutineBodyOutput += "\n" + "\t".repeat(tabN) + outputData;
        i++;
    }
    compileSubroutineBodyOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]);

    return [compileSubroutineBodyOutput + `\n${("\t".repeat(tabN-1))}</subroutineBody>`, i];
}


const ifStatement = [["if", "keyword"], ["(", "symbol"], ["", "expression"], [")", "symbol"], ["{", "symbol"], ["", "statements"], ["}", "symbol"]];
const whileStatement = [["while", "keyword"], ["(", "symbol"], ["", "expression"], [")", "symbol"], ["{", "symbol"], ["", "statements"], ["}", "symbol"]];

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
        
        console.log("statements", tokens[i], i);
        compileStatementsOutput += "\n" + "\t".repeat(tabN) + outputData;
        i++;
    }

    return [compileStatementsOutput + `\n${("\t".repeat(tabN-1))}</statements>`, --i];
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
            j++;
        } else {
            compileLetOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
        }
    }

    return [compileLetOutput + `\n${("\t".repeat(tabN-1))}</letStatement>`, --i];
}

// Parse block

function compileBlock(tokens, i, tabN) {
    console.log("enter compileBlock", tokens[i], i);
    let compileBlockOutput = eat(tokens[i++]);
    let outputData = "";

    [outputData, i] = compileStatements(tokens, i, tabN+1);

    compileBlockOutput += "\n" + "\t".repeat(tabN) + outputData;

    console.log("block", i, tokens[i]);
    compileBlockOutput += "\n" + "\t".repeat(tabN) + eat(tokens[++i]);

    return [`\n${"\t".repeat(tabN)}${compileBlockOutput}`, --i];
}


function compileIf(tokens, i, tabN) {
    let compileIfOutput = "<ifStatement>";
    let outputData = "";

    
    while(tokens[i][0] !== "}" || (tokens[i+1][0] === "else")) {
        console.log(tokens[i], i);
        if (tokens[i][0] === "(") {
            outputData = "\n" + "\t".repeat(tabN) + eat(tokens[i++]);
            while(tokens[i][0] !== ")") {
                i++;
            }
            outputData += "\n" + "\t".repeat(tabN) + ":) expression :)";
            outputData += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
        } else if (tokens[i][0] === "{") {
            [outputData, i] = compileBlock(tokens, i, tabN);
        } else {
            outputData = "\n" + "\t".repeat(tabN) + eat(tokens[i]);
        }

        compileIfOutput += "\n" + "\t".repeat(tabN) + outputData;
        i++;
    }

    return [`\n${"\t".repeat(tabN-1)}${compileIfOutput}`, --i];
    
}

function compileWhile(tokens, i, tabN) {
    let compileWhileOutput = "<whileStatement>";
    let outputData = "";

    while (tokens[i][0] !== "}") {
        if (tokens[i][0] === "(") {
            outputData = "\n" + "\t".repeat(tabN) + eat(tokens[i++]);
            while(tokens[i][0] !== ")") {
                i++;
            }
            outputData += "\n" + "\t".repeat(tabN) + ":) expression :)";
            outputData += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
        } else if (tokens[i] === "{") {
            [outputData, i] = compileBlock(tokens, i, tabN);
        }

        compileWhileOutput += "\n" + "\t".repeat(tabN) + outputData;
        i++;
    }

    return [`\n${"\t".repeat(tabN-1)}${compileWhileOutput}`, --i];
}

//function compileBlock(tokens, i, compareTemp, blockName, tabN) {
//    let compileIfOutput = `<${blockName}>`;
//   
//
//    for (let j = 0; j < compareTemp.length; j++, i++) {
//        console.log(tokens[i], i);
//        let outputData = "";
//
//        if (compareTemp[j][1] === "expression") {
//            while (tokens[i][0] !== compareTemp[j+1][0]) {
//                i++;
//            }
//            outputData = ":) exprextion :)";
//            outputData += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
//            j++;
//        } else if (compareTemp[j][1] === "statements") {
//            [outputData, i] = compileStatements(tokens, i, tabN+1);
//            console.log("after statements");
//            outputData += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
//        } else {
//            outputData = eat(tokens[i]);
//        }
//
//        compileIfOutput += "\n" + "\t".repeat(tabN) + outputData;
//    }
//    
//    return [compileIfOutput + `\n${("\t".repeat(tabN-1))}</${blockName}>`, --i];
//}


const doStatement = [["do", "keyword"], ["", "identifier"], ["(", "symbol"], ["", "expressionList"], [")", "symbol"], [";", "symbol"]];

function compileDo(tokens, i, tabN) {
    const compareTemp = doStatement;
    let compileDoOutput = "<doStatement>";
    
    
    for (let j = 0; j < compareTemp.length; j++, i++) {
        let outputData = "";
        if (tokens[i][0] !== "(" && compareTemp[j][0] === "(") {
            while(tokens[i][0] !== "(") {
                compileDoOutput += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
                i++;
            }
            outputData = eat(tokens[i]);
        } else if (compareTemp[j][1] === "expressionList") {
            while (tokens[i][0] !== compareTemp[j+1][0]) {
                i++;
            }
            outputData += ":) expressionList :)";
            outputData += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
            j++;
        } else {
            outputData += eat(tokens[i]);
        }

        compileDoOutput += "\n" + "\t".repeat(tabN) + outputData;
    }

    return [compileDoOutput + `\n${("\t".repeat(tabN-1))}</doStatement>`, --i];
}


const returnStatement = [["return", "keyword"], ["?", "expression"], [";", "symbol"]];

function compileReturn(tokens, i, tabN) {
    const compareTemp = returnStatement;
    let compileReturnOutput = "<returnStatement>";
    for(let j = 0; j < compareTemp.length; j++, i++) {
        let outputData = "";
        if (tokens[i][0] === ";" && compareTemp[j][0] !== ";") {
            i--;
            continue;
        } else if (compareTemp[j][1] === "expression") {
            while(tokens[i][0] !== compareTemp[j+1][0]) {
                i++;
            }
            outputData += ":) exprextion :)"; 
            outputData += "\n" + "\t".repeat(tabN) + eat(tokens[i]);
            j++;
        } else {
            outputData = eat(tokens[i]);
        }

        compileReturnOutput += "\n" + "\t".repeat(tabN) + outputData;
    }

    return [compileReturnOutput + `\n${("\t".repeat(tabN-1))}</returnStatement>`, --i];
}


// Handling expression
function compileExpression() {}
function compileTerm() {}
function compileExpressionList() {}
