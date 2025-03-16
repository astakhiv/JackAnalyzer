import fs from "node:fs";
import { getTokensWithTypes, tokensToXML } from "./Tokenizer.js";

function main () {
    const [path, type] = getWorkingPathAndType();

    if (type === "file") {
        processFile(path);
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

    for (let i = 0; i < files.length; i++) {
        const ext = files[i].slice(-5);

        if (ext === ".jack") {
            processFile(path + files[i]);
        }
    }
}

function processFile(path) {
    // TODO
    console.log("Proessing: " + path);
    const sourceCode = fs.readFileSync(path, "utf8");

    const tokens = getTokensWithTypes(sourceCode);
    const XML = tokensToXML(tokens);

    const pathArr = path.split("/");
    const fileName = pathArr[pathArr.length-1].slice(0, -5) + "T.xml";

    console.log("Writing to: " + process.cwd() + "/" + fileName);
    fs.writeFileSync(process.cwd() + "/" + fileName, XML);
}


