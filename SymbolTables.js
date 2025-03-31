export let classSymbolTable = {};
export let subroutineSymbolTable = {};
export let classVariableSymbolTable = {};
export let methodVariableSymbolTable = {};

export function clearTable(table) {
    for (let name in table) {
        delete table[name];
    }
}


export function composeSymbolTable(tokens) {
    let curClass = "";
    

    for (let i = 1; i < tokens.length; i++) {
        if (tokens[i-1][0] === "class") {
            curClass = tokens[i][0];
            const classData = [curClass, curClass, "class", NaN]; 

            classSymbolTable[curClass] = classData;
        }

        if (tokens[i][0] === "function" || tokens[i][0] === "constructor" || tokens[i][0] === "method") {
            const subroutineData = ["", "subroutine", tokens[i][0], NaN];
            i+=2;
            subroutineData[0] = `${curClass}.${tokens[i][0]}`;
            
            subroutineSymbolTable[subroutineData[0]] = subroutineData;
            
        }
    }    

}

