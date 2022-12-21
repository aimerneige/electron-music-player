const { ipcRenderer } = require("electron");
const { $ } = require("./helper");
const path = require("path");

let musicFilesPath = [];

$("select-music").addEventListener("click", () => {
  ipcRenderer.send("open-music-file");
});

$("import-music").addEventListener("click", () => {
  ipcRenderer.send("add-tracks", musicFilesPath);
});

const renderListHTML = (pathes) => {
  const musicList = $("music-list");
  const musicItemsHTML = pathes.reduce((html, music) => {
    html += `<li class="list-group-item">${path.basename(music)}</li>`;
    return html;
  }, "");
  musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`;
};

ipcRenderer.on("selected-file", (event, paths) => {
  if (Array.isArray(paths)) {
    renderListHTML(paths);
    musicFilesPath = paths;
  }
});
