import { classSymbolTable, subroutineSymbolTable, classVariableSymbolTable, methodVariableSymbolTable, clearTable} from "./SymbolTables.js";

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

const symbolTables = [classSymbolTable, subroutineSymbolTable, classVariableSymbolTable, methodVariableSymbolTable];
function eatIdentifier(token, tabN, state="used") {
    let tokenData;
    for (let i = 0; tokenData === undefined; i++) {
        tokenData = symbolTables[i][token[0]];
    } 
    
    let eatIdentifierOutput = `<identifier>`;
    eatIdentifierOutput += indent(tabN, eat([tokenData[0], "name"]));
    eatIdentifierOutput += indent(tabN, eat([tokenData[1], "type"]));
    eatIdentifierOutput += indent(tabN, eat([tokenData[2], "kind"]));
    eatIdentifierOutput += indent(tabN, eat([tokenData[3], "index"]));
    eatIdentifierOutput += indent(tabN, eat([state, "state"]));
    eatIdentifierOutput += indent(tabN-1, "</identifier>"); 
    

    return eatIdentifierOutput;
}
// Handling program structure
let curClass = "";
let curSubroutine = "";

let variableKindCount = {"static": 0, "field": 0, "local": 0, "argument": 0};

function compileClass(tokens, i) {
    clearTable(classVariableSymbolTable);

    variableKindCount["static"] = 0;
    variableKindCount["field"] = 0;
    
    const tabN = 1;
    let compileClassOutput = "<class>";
    let outputData = "";

    compileClassOutput += indent(tabN, eat(tokens[i++]));
    curClass = tokens[i][0];
    
    classSymbolTable[tokens[i][0]] = [tokens[i][0], tokens[i][0], "class", NaN];

    compileClassOutput += indent(tabN, eatIdentifier(tokens[i++], tabN+1, "declared"));
    compileClassOutput += indent(tabN, eat(tokens[i++]));

    while(tokens[i][0] !== "}") {
        switch(tokens[i][0]) {
            case "field":
            case "static":
                [outputData, i] = compileVarDec(tokens, i, 2, "classVarDec");
                break;
            case "constructor":
            case "method":
            case "function":
                [outputData, i] = compileSubroutineDec(tokens, i, 2);
                break;
        }

        compileClassOutput += indent(1, outputData); 
        i++;
    }

    compileClassOutput += indent(tabN, eat(tokens[i++]));

    return [compileClassOutput + indent(tabN-1, "</class>"), i];
}


const variableKind = {"field": "field", "static": "static", "var": "local"};

function compileVarDec(tokens, i, tabN, type) {
    let compileVarDecOutput = `<${type}>`;
    
    const variableData = ["", "", "", NaN];
    const symbolTable = (type === "classVarDec") ? classVariableSymbolTable : methodVariableSymbolTable;
     
    variableData[2] = variableKind[tokens[i][0]];
    compileVarDecOutput += indent(tabN, eat(tokens[i++]));
    variableData[1] = tokens[i][0];
    compileVarDecOutput += indent(tabN, eat(tokens[i++]));
    
    let loop = true;
    while(loop) {
        variableData[0] = tokens[i][0];
        variableData[3] = variableKindCount[variableData[2]]++;
        symbolTable[tokens[i][0]] = variableData;
        compileVarDecOutput += indent(tabN, eatIdentifier(tokens[i++], tabN+1, "declared"));
        
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
    clearTable(methodVariableSymbolTable);
    variableKindCount["local"] = 0;

    let compileSubroutineDecOutput = "<subroutineDec>";
    let outputData = "";
   
    const subroutineData = ["", "subroutine", "", NaN];
    // Subroutine header
    subroutineData[2] = tokens[i][0];
    compileSubroutineDecOutput += indent(tabN, eat(tokens[i++]));
    compileSubroutineDecOutput += indent(tabN, eat(tokens[i++]));

    curSubroutine = tokens[i][0];
    subroutineData[0] = `${curClass}.${curSubroutine}`;
    subroutineSymbolTable[tokens[i][0]] = subroutineData;
    compileSubroutineDecOutput += indent(tabN, eatIdentifier(tokens[i++], tabN+1, "declared"));
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
    variableKindCount["argument"] = 0;

    let parameterData = ["", "", "argument", NaN];
    let compileParameterListOutput = `<parameterList>`;

    while (tokens[i][0] !== ")") {
        parameterData[1] = tokens[i][0];
        compileParameterListOutput += indent(tabN, eat(tokens[i++]));
        parameterData[0] = tokens[i][0];
        parameterData[3] = variableKindCount["argument"]++;
        methodVariableSymbolTable[parameterData[0]] = parameterData;

        compileParameterListOutput += indent(tabN, eatIdentifier(tokens[i++], tabN+1, "declared"));
    
        if (tokens[i][0] === ")") {
            break;
        } else {
            compileParameterListOutput += indent(tabN, eat(tokens[i++]));
        }

    }

    return [compileParameterListOutput + indent(tabN-1, `</parameterList>`), --i];
}

function compileSubroutineBody(tokens, i, tabN) {
    let compileSubroutineBodyOutput = "<subroutineBody>";
    let outputData = "";
    
    compileSubroutineBodyOutput += indent(tabN, eat(tokens[i++]));
    
    while(tokens[i][0] !== "}") {
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
    let outputData = "";
    
    statementsLoop: while (true) {

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
    compileLetOutput += indent(tabN, eatIdentifier(tokens[i++], tabN+1)); 

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
    let compileBlockOutput = eat(tokens[i++]);
    let outputData = "";
    
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
    
    compileDoOutput += indent(tabN, eat(tokens[i++], tabN+1));


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
            outputData += indent(tabN, eat(tokens[i++]));
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
