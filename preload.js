const { contextBridge } = require("electron");
const { Client, Authenticator } = require("minecraft-launcher-core");
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");

const loadJSON = path => JSON.parse(readFileSync(join(__dirname, path), "utf-8"));

const { forge, mods } = loadJSON("mods.json");
const data = loadJSON("data.json");

const launcher = new Client();

const downloadFile = async (url, path) => {
    const f = await fetch(url);
    const buf = await f.arrayBuffer();
    writeFileSync(path, Buffer.from(buf));
};

contextBridge.exposeInMainWorld("minecraft", {
    "download": async () => {
        if(!existsSync(data.root)) mkdirSync(data.root);
        if(!existsSync(data.jars)) mkdirSync(data.jars);
        if(!existsSync(join(data.root, data.modsPath))) mkdirSync(join(data.root, data.modsPath));
        await downloadFile(forge, join(data.jars, data.forgePath));
        for(let i of mods)
            await downloadFile(i.url, join(data.root, data.modsPath, i.path));
        console.log(1)
    },
    "run": user => {
        const opts = {
            "authorization": Authenticator.getAuth(user),
            "root": data.root,
            "version": data.version,
            "memory": data.memory,
            "forge": join(data.jars, data.forgePath),
            "quickPlay": {
                "type": "multiplayer",
                "identifier": data.ip
            },
            "window": {
                "fullscreen": true
            }
        };
    },
    "installed": () => {
        return existsSync(data.root) && existsSync(data.jars);
    }
})