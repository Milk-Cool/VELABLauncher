const { app, BrowserWindow } = require("electron");
const { join } = require("path");

const createWindow = () => {
    const win = new BrowserWindow({
        "minWidth": 900,
        "minHeight": 700,
        "webPreferences": {
            "sandbox": false,
            "nodeIntegration": true,
            "contextIsolation": false
        }
    });
    win.maximize();
    win.loadFile("html/index.html");
    if(!process.env.TEST) win.removeMenu();
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
