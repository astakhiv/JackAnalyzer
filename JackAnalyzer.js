import fs from "node:fs";

function main () {
    const [path, type] = getWorkingPathAndType();

    console.log(`Path: ${path}\nType: "${type}"`);

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

    const slash = path[path.length-1] === "/" ? "": "/";

    return [path + slash, type];
}

function processFile(path) {
    // TODO
    console.log("Proessing: " + path);
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

