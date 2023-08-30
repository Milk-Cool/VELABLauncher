const { Client, Authenticator } = require("minecraft-launcher-core");
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");

const loadJSON = path => JSON.parse(readFileSync(join(__dirname, "../", path), "utf-8"));

const { forge, mods } = loadJSON("mods.json");
const data = loadJSON("data.json");

const launcher = new Client();
launcher.on("debug", console.log);
launcher.on("data", console.log);
launcher.on("progress", console.log);

const downloadFile = async (url, path) => {
    const f = await fetch(url);
    const buf = await f.arrayBuffer();
    writeFileSync(path, Buffer.from(buf));
};

const download = async () => {
    if(!existsSync(data.root)) mkdirSync(data.root);
    if(!existsSync(data.jars)) mkdirSync(data.jars);
    if(!existsSync(join(data.root, data.modsPath))) mkdirSync(join(data.root, data.modsPath));
    await downloadFile(forge, join(data.jars, data.forgePath));
    for(let i of mods)
        await downloadFile(i.url, join(data.root, data.modsPath, i.path));
};
const run = async user => {
    const opts = {
        // "authorization": await Authenticator.getAuth(user),
        "authorization": Authenticator.getAuth(user),
        "root": data.root,
        "version": data.version,
        "memory": data.memory,
        "forge": join(data.jars, data.forgePath),
        "quickPlay": {
            "type": "multiplayer",
            "identifier": data.ip,
            "path": join(data.root, "quickplaylog.txt")
        },
        "window": {
            "fullscreen": true
        }
    };
    console.log(opts);
    await launcher.launch(opts);
};
const installed = () => {
    return existsSync(data.root) && existsSync(data.jars);
}