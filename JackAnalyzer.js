import { getTokensWithTypes, tokensToXML } from "./Tokenizer.js";
import fs from "node:fs";
import { compileFile } from "./CompilationEngine.js";
import { classSymbolTable, composeSymbolTable, subroutineSymbolTable } from "./SymbolTables.js";

export let curPath = process.cwd();


function main () {
    const [path, type] = getWorkingPathAndType();

    curPath = path;

    if (type === "file") {
        console.log("Pass dir please");
    } else {
        processDir(path);
    }

}

main();

function getWorkingPathAndType() {
    let path = process.cwd();
    let type = "dir";

    if (process.argv.length >= 3) {
        const pathArr = process.argv[2].split("/");
        
        if (pathArr[pathArr.length-1].slice(-5) === ".jack") {
            type = "file";
        }

        path = process.argv[2];
    }

    const slash = (path[path.length-1] === "/" || type === "file") ? "": "/";
    
    return [path + slash, type];
}


function processDir(path) {
    const files = fs.readdirSync(path);

    const jackFiles = [];
    for (let i = 0; i < files.length; i++) {
        const ext = files[i].slice(-5);

        if (ext === ".jack") {
            jackFiles.push(files[i]);
        }
    }

    const tokens = [];
    for (let i = 0; i < jackFiles.length; i++) {
        tokens.push(processFileTokes(path + jackFiles[i]));
    }
    
    for (let i = 0; i < jackFiles.length; i++) {
        composeSymbolTable(tokens[i]);
    }

    console.log("classSymbolTable:", classSymbolTable);
    console.log("subroutineSymbolTable", subroutineSymbolTable);

    for (let i = 0; i < jackFiles.length; i++) {
        processFile(path + jackFiles[i], tokens[i]);
    }

}


function processFileTokes(path) {
    console.log("Proessing: " + path);
    const sourceCode = fs.readFileSync(path, "utf8");

    const tokens = getTokensWithTypes(sourceCode);
    const XML = tokensToXML(tokens);

    const pathArr = path.split("/");
    const fileNameT = pathArr[pathArr.length-1].slice(0, -5) + "T.xml";

    console.log("Writing to: " + process.cwd() + "/" + fileNameT);
    fs.writeFileSync(process.cwd() + "/" + fileNameT, XML);
    
    return tokens;
}

function processFile(path, tokens) {
    if (tokens === undefined) {
        tokens = processFileTokes(path);
    }

    const compilerOutput = compileFile(tokens);
    
    const pathArr = path.split("/");
    const fileName = pathArr[pathArr.length-1].slice(0, -5) + ".xml";

    console.log("Writing to: " + process.cwd() + "/" + fileName);
    fs.writeFileSync(process.cwd() + "/" + fileName, compilerOutput);
}

 
