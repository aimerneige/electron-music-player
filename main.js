const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const Store = require("electron-store");
const DataStore = require("./renderer/MusicDataStore");

const myStore = new DataStore({
  name: "MusicData",
});

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    };
    const finalConfig = { ...basicConfig, ...config };
    super(finalConfig);
    this.loadFile(fileLocation);
    this.once("ready-to-show", () => {
      this.show();
    });
  }
}

app.on("ready", () => {
  const mainWindow = new AppWindow({}, "./renderer/index.html");
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.send("get-tracks", myStore.getTracks());
  });
  ipcMain.on("add-music-window", () => {
    const addWindow = new AppWindow(
      {
        width: 500,
        height: 400,
        parent: mainWindow,
      },
      "./renderer/add.html"
    );
  });
  ipcMain.on("open-music-file", (event) => {
    dialog
      .showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Music", extensions: ["mp3", "wav"] }],
      })
      .then((value) => {
        if (value.filePaths) {
          event.sender.send("selected-file", value.filePaths);
        }
      });
  });
  ipcMain.on("add-tracks", (event, tracks) => {
    const updatedTracks = myStore.addTracks(tracks).getTracks();
    mainWindow.send("get-tracks", updatedTracks);
  });
  ipcMain.on("delete-track", (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks();
    mainWindow.send("get-tracks", updatedTracks);
  });
});
