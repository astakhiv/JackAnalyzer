export let classSymbolTable = {};
export let subroutineSymbolTable = {};
export let classVariableSymbolTable = {};
export let methodVariableSymbolTable = {};

export function clearTable(table) {
    for (let name in table) {
        delete table[name];
    }
}
