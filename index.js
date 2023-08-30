const { app, BrowserWindow } = require("electron");
const { join } = require("path");

const createWindow = () => {
    const win = new BrowserWindow({
        "webPreferences": {
            "sandbox": false,
            "preload": join(__dirname, "preload.js")
        }
    });
    win.maximize();
    win.loadFile("html/index.html");
    win.show();
}

// app.commandLine.appendArgument("disable-gpu");
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendArgument("disable-gpu-compositing");

app.whenReady().then(() => {
    createWindow();
});

app.on("window-all-closed", () => {
    if(process.platform != "darwin") app.quit();
})