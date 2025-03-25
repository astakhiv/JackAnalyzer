export function compileFile(tokens) {

    let compilerOutput = "";

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i][0] === "class") {
            [compilerOutput, i] = compileClass(tokens, i);
        }
    }

    return compilerOutput;
}

const eat = (token) => `<${token[1]}> ${token[0]} </${token[1]}>`;
const indent = (tabN, str) => `\n${("\t".repeat(tabN))}${str}`;

// Handling program structure

const classTemplate = [["class", "keyword"], ["", "identifier"], ["{", "symbol"], ["}", "symbol"]];

function compileClass(tokens, i) {
    let compileClassOutput = "<class>";

    for (let j = 0; j < classTemplate.length; j++, i++) {
        let outputData = "";

        switch(tokens[i][0]) {
            case "field":
            case "static":
                [outputData, i] = compileVarDec(tokens, i, 2, "classVarDec");
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

        compileClassOutput += indent(1, outputData); 
    }

    return [compileClassOutput + indent(0, "</class>"), i]
}


function compileVarDec(tokens, i, tabN, type) {
    let compileVarDecOutput = `<${type}>`;
    
    compileVarDecOutput += indent(tabN, eat(tokens[i++]));
    compileVarDecOutput += indent(tabN, eat(tokens[i++]));
    
    let loop = true;
    while(loop) {
        compileVarDecOutput += indent(tabN, eat(tokens[i++]));
        
        if (tokens[i][0] === ",") {
            compileVarDecOutput += indent(tabN, eat(tokens[i++]));
        } else {
            loop = false;
        }
    }
    
    compileVarDecOutput += indent(tabN, eat(tokens[i]));
    return [compileVarDecOutput + indent(tabN-1, `</${type}>`), i];
}



function compileSubroutineDec(tokens, i, tabN) {
    let compileSubroutineDecOutput = "<subroutineDec>";
    let outputData = "";
   
    // Subroutine header
    compileSubroutineDecOutput += indent(tabN, eat(tokens[i++]));
    compileSubroutineDecOutput += indent(tabN, eat(tokens[i++]));
    compileSubroutineDecOutput += indent(tabN, eat(tokens[i++]));
    compileSubroutineDecOutput += indent(tabN, eat(tokens[i++]));

    // Parameters
    [outputData, i] = compileParameterList(tokens, i, tabN+1);

    compileSubroutineDecOutput += indent(tabN, outputData);
    i++;

    compileSubroutineDecOutput += indent(tabN, eat(tokens[i++]));

    // Subroutine body
    [outputData, i] = compileSubroutineBody(tokens, i, tabN+1); 
    compileSubroutineDecOutput += indent(tabN, outputData);

    return [compileSubroutineDecOutput + indent(tabN-1, "</subroutineDec>"), i];
}


function compileParameterList(tokens, i, tabN) {
    let compileParameterListOutput = `<parameterList>`;

    while (tokens[i][0] !== ")") {
        compileParameterListOutput += indent(tabN, eat(tokens[i]));
        i++;
    }

    return [compileParameterListOutput + indent(tabN-1, `</parameterList>`), --i];
}

function compileSubroutineBody(tokens, i, tabN) {
    let compileSubroutineBodyOutput = "<subroutineBody>";
    
    compileSubroutineBodyOutput += indent(tabN, eat(tokens[i++]));
    
    while(tokens[i][0] !== "}") {
        let outputData = "";
        if (tokens[i][0] === "var") {
            [outputData, i] = compileVarDec(tokens, i, tabN+1, "varDec");
        } else {
            [outputData, i] = compileStatements(tokens, i, tabN+1);
        }

        compileSubroutineBodyOutput += indent(tabN, outputData);
        i++;
    }

    compileSubroutineBodyOutput += indent(tabN, eat(tokens[i]));

    return [compileSubroutineBodyOutput + indent(tabN-1, "</subroutineBody>"), i];
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
        
        compileStatementsOutput += indent(tabN, outputData);
        i++;
    }
    
    return [compileStatementsOutput + indent(tabN-1, "</statements>"), --i];
}

// Handling statements

function compileLet(tokens, i, tabN) {
    let compileLetOutput = "<letStatement>";
    let outputData = "";

    compileLetOutput += indent(tabN, eat(tokens[i++])); 
    compileLetOutput += indent(tabN, eat(tokens[i++])); 

    if (tokens[i][0] === "[") {
        compileLetOutput += indent(tabN, eat(tokens[i++]));
        
        [outputData, i] = compileExpression(tokens, i, tabN+1);
        compileLetOutput += indent(tabN, outputData);
        i++;

        compileLetOutput += indent(tabN, eat(tokens[i++]));
    }

    compileLetOutput += indent(tabN, eat(tokens[i++]));

    [outputData, i] = compileExpression(tokens, i, tabN+1);
    compileLetOutput += indent(tabN, outputData);
    i++;
    compileLetOutput += indent(tabN, eat(tokens[i]));

    return [compileLetOutput + indent(tabN-1, "</letStatement>"), i];
}

function compileBlock(tokens, i, tabN) {
    let outputData = "";

    let compileBlockOutput = eat(tokens[i++]);

    [outputData, i] = compileStatements(tokens, i, tabN+1);

    compileBlockOutput += indent(tabN, outputData);
    i++;

    compileBlockOutput += indent(tabN, eat(tokens[i]));
    
    return [compileBlockOutput, i];
}


function compileIf(tokens, i, tabN) {
    let compileIfOutput = "<ifStatement>";
    let outputData = "";

    compileIfOutput += indent(tabN, eat(tokens[i++]));
    compileIfOutput += indent(tabN, eat(tokens[i++]));
    
    [outputData, i] = compileExpression(tokens, i, tabN+1);
    compileIfOutput += indent(tabN, outputData);
    i++;

    compileIfOutput += indent(tabN, eat(tokens[i++]));

    [outputData, i] = compileBlock(tokens, i, tabN);
    compileIfOutput += indent(tabN, outputData);
    i++;

    if (tokens[i][0] === "else") {
        compileIfOutput += indent(tabN, eat(tokens[i++]));
        
        [outputData, i] = compileBlock(tokens, i, tabN);
        compileIfOutput += indent(tabN, outputData);
        i++;
    }

    return [compileIfOutput + indent(tabN-1, "</ifStatement>"), --i];
}


function compileWhile(tokens, i, tabN) {
    let compileWhileOutput = "<whileStatement>";
    let outputData = "";
    
    compileWhileOutput += indent(tabN, eat(tokens[i++]));
    compileWhileOutput += indent(tabN, eat(tokens[i++]));

    [outputData, i] = compileExpression(tokens, i, tabN+1)
    compileWhileOutput += indent(tabN, outputData);
    i++;

    compileWhileOutput += indent(tabN, eat(tokens[i++]));
    
    [outputData, i] = compileBlock(tokens, i, tabN)
    compileWhileOutput += indent(tabN, outputData);

    return [compileWhileOutput + indent(tabN-1, "</whileStatement>"), i];
}


function compileDo(tokens, i, tabN) {
    let compileDoOutput = "<doStatement>";
    let outputData = "";

    compileDoOutput += indent(tabN, eat(tokens[i++]));
    compileDoOutput += indent(tabN, eat(tokens[i++]));


    if (tokens[i][0] === ".") {
        compileDoOutput += indent(tabN, eat(tokens[i++]));
        compileDoOutput += indent(tabN, eat(tokens[i++]));
    } 
 
    compileDoOutput += indent(tabN, eat(tokens[i++]));
    
    [outputData, i] = compileExpressionList(tokens, i, tabN+1);
    compileDoOutput += indent(tabN, outputData);
    i++;

    compileDoOutput += indent(tabN, eat(tokens[i++]));
    compileDoOutput += indent(tabN, eat(tokens[i++]));
    
    
    return [compileDoOutput + indent(tabN-1, "</doStatement>"), --i];
}


function compileReturn(tokens, i, tabN) {
    let compileReturnOutput = "<returnStatement>";
    let outputData = "";

    compileReturnOutput += indent(tabN, eat(tokens[i++]));    

    if (tokens[i][0] !== ";") {
        [outputData, i] = compileExpression(tokens, i, tabN+1);
        compileReturnOutput += indent(tabN, outputData);
        i++;
    }

    compileReturnOutput += indent(tabN, eat(tokens[i++]));        

    return [compileReturnOutput + indent(tabN-1, "</returnStatement>"), --i];
}


// Handling expression

const opList = {"+": true, "-": true, "*": true, "/": true, "&amp;": true, "|": true, "&lt;": true, "&gt;": true, "=": true};

function compileExpression(tokens, i, tabN) {
    let compileExpressionOutput = "<expression>";

    let outputData = "";
    let loop = true;
    while (loop) {
        [outputData, i] = compileTerm(tokens, i, tabN+1);
        i++; 
    
        if (opList[tokens[i][0]] === true) {
            outputData += indent(tabN, eat(tokens[i]));
            i++;
        } else {
            loop = false;
        }

        compileExpressionOutput += indent(tabN, outputData);
    }

    return [compileExpressionOutput + indent(tabN-1, "</expression>"), --i];
}


const constantList = {"integerConstant": true, "stringConstant": true, "keyword": true};
const additionalIdentifierSymbols = {"[": true, "(": true, ".": true};

function compileTerm(tokens, i, tabN) {
    let compileTermOutput = "<term>";
    let outputData = "";
    
    console.log("compileTerm:", tokens[i], i);
    if (constantList[tokens[i][1]] || (tokens[i][1] === "identifier" && additionalIdentifierSymbols[tokens[i+1][0]] === undefined)) {
        compileTermOutput += indent(tabN, eat(tokens[i++]));
    } else if (tokens[i][1] === "identifier") {
        compileTermOutput += indent(tabN, eat(tokens[i++]));
        compileTermOutput += indent(tabN, eat(tokens[i++]));
        
        if (tokens[i-1][0] === "[") {
            [outputData, i] = compileExpression(tokens, i, tabN+1);
        } else  {
            if (tokens[i-1][0] === ".") {
                compileTermOutput += indent(tabN, eat(tokens[i++]));
                compileTermOutput += indent(tabN, eat(tokens[i++]));
            }

            [outputData, i] = compileExpressionList(tokens, i, tabN+1);
        }

        compileTermOutput += indent(tabN, outputData);
        i++;

        compileTermOutput += indent(tabN, eat(tokens[i++]));
    } else if (tokens[i][0] === "(") { 
        compileTermOutput += indent(tabN, eat(tokens[i++]));

        [outputData, i] = compileExpression(tokens, i, tabN+1);
        compileTermOutput += indent(tabN, outputData);
        i++;

        compileTermOutput += indent(tabN, eat(tokens[i++]));
    } else {
        compileTermOutput += indent(tabN, eat(tokens[i++]));
        
        [outputData, i] = compileTerm(tokens, i, tabN+1);
        compileTermOutput += indent(tabN, outputData);
        i++;
    }

    console.log("compileTerm end:", tokens[i], i);
    return [compileTermOutput + indent(tabN-1, "</term>"), --i];
}


function compileExpressionList(tokens, i, tabN) {
    let compileExpressionListOutput = "<expressionList>";
    let outputData = "";

    while(tokens[i][0] !== ")") {
        [outputData, i] = compileExpression(tokens, i, tabN+1);
        i++;

        if (tokens[i][0] === ",") {
            outputData += indent(tabN, eat(tokens[i]));
            i++;
        } 

        compileExpressionListOutput += indent(tabN, outputData);
    }

    return [compileExpressionListOutput + indent(tabN-1, "</expressionList>"), --i];
}
