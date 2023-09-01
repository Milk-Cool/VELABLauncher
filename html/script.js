const { Client, Authenticator } = require("minecraft-launcher-core");
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");

if(!localStorage.getItem("username"))
    localStorage.setItem("username", "");
document.querySelector("#username").value = localStorage.getItem("username");

document.querySelector("#username").addEventListener("input", () => {
    localStorage.setItem("username", document.querySelector("#username").value);
})

const loadJSON = path => JSON.parse(readFileSync(join(__dirname, "../", path), "utf-8"));

const { forge, mods } = loadJSON("mods.json");
const data = loadJSON("data.json");

let text = "VELAB";
let progress = 0;
let of = 0;

const launcher = new Client();
launcher.on("debug", e => document.querySelector("#logs").value += e + "\n");
launcher.on("data", e => document.querySelector("#logs").value += e + "\n");
launcher.on("download", e => document.querySelector("#logs").value += "Скачиваем " + e + "\n");
launcher.on("progress", e => {
    document.querySelector("#logs").value += JSON.stringify(e) + "\n";
    switch(e.type){
        case "classes-maven-custom":
            text = "Кастомные классы Maven";
            break;
        case "classes-custom":
            text = "Кастомные классы";
            break;
        case "classes":
            text = "Классы";
            break;
        case "assets":
            text = "Ассеты";
            break;
        default:
            text = "Подождите...";
    }
    progress = e.task;
    of = e.total;
    if(e.task == e.total && e.type == "assets") {
        text = "Запускаем Minecraft...";
        of = 0;
    }
});
launcher.on("close", () => document.querySelector("#run").disabled = false);

const downloadFile = async (url, path) => {
    document.querySelector("#logs").value += "Скачиваем " + path + "\n";
    const f = await fetch(url);
    const buf = await f.arrayBuffer();
    writeFileSync(path, Buffer.from(buf));
    document.querySelector("#logs").value += "Скачали " + path + "\n";
};

const download = async () => {
    const inst = installed();
    if(!existsSync(data.root)) mkdirSync(data.root);
    if(!existsSync(data.jars)) mkdirSync(data.jars);
    if(!existsSync(join(data.root, data.modsPath))) mkdirSync(join(data.root, data.modsPath));
    text = "Скачиваем Forge...";
    progress = 0;
    of = mods.length + 1;
    const forgeP = join(data.jars, data.forgePath);
    if(inst || !existsSync(forgeP))
        await downloadFile(forge, forgeP);
    progress++;
    text = "Скачиваем моды...";
    for(let i of mods) {
        const p = join(data.root, data.modsPath, i.path);
        if(inst || !existsSync(p))
            await downloadFile(i.url, p);
        progress++;
    }
    text = "Готово!";
    of = 0;
    document.querySelector("#run").disabled = false;
    document.querySelector("#download").innerText = "Переустановить";
};
const run = async user => {
    if(!document.querySelector("#username").value)
        return alert("Вы не ввели имя пользователя!");
    document.querySelector("#run").disabled = true;
    text = "Подождите...";
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
    if(!existsSync(data.root) || !existsSync(data.jars)) return false;
    if(!existsSync(join(data.root, data.modsPath))) return false;
    if(!existsSync(join(data.jars, data.forgePath))) return false;
    for(let i of mods)
        if(!existsSync(join(data.root, data.modsPath, i.path)))
            return false;
    return true;
}

if(installed()) {
    document.querySelector("#download").innerText = "Переустановить";
} else {
    document.querySelector("#run").disabled = true;
}

const randomBg = "bg" + Math.floor(Math.random() * 5);
document.querySelector("img#bg").classList.add(randomBg);

document.querySelector("#logs").style.display = "none";
let logsShown = false;
const toggleLogs = () => {
    logsShown = !logsShown;
    if(logsShown) {
        document.querySelector("#logs").style.display = "inline-block";
        document.querySelector("#icon").style.display = "none";
    } else {
        document.querySelector("#logs").style.display = "none";
        document.querySelector("#icon").style.display = "inline-block";
    }
}

setInterval(() => {
    document.querySelector("#progress").innerText = text + (of ? ` (${progress}/${of})` : "");
    document.querySelector("#bar").style.width = of == 0 ? "100%" : (progress / of * 100) + "%";

    document.querySelector("#logs").scrollTo(0, document.querySelector("#logs").scrollHeight);
}, 20);