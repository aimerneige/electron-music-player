const { ipcRenderer } = require("electron");
const { $, convertDuration } = require("./helper");

let musicAudio = new Audio();
let allTracks;
let currentTrack;

$("add-music-button").addEventListener("click", () => {
  ipcRenderer.send("add-music-window");
});

const renderListHTML = (tracks) => {
  const tracksList = $("tracks-list");
  const tracksListHTML = tracks.reduce((html, track) => {
    html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center">
                <div class="col-10">
                  <i class="fas fa-music me-2 text-secondary"></i>
                  <b>${track.fileName}</b>
                </div>
                <div class="col-2">
                  <i class="fas fa-play me-3" data-id="${track.id}"></i>
                  <i class="fas fa-trash-can" data-id="${track.id}"></i>
                </div>
              </li>`;
    return html;
  }, "");
  tracksList.innerHTML = tracks.length
    ? `<ul class="list-group">${tracksListHTML}</ul>`
    : `<div class="alert alert-primary">No music added.</div>`;
};

const renderPlayerHTML = (name, duration) => {
  const player = $("player-status");
  const html = `<div class="col font-weight-bold">
                  Now Playing: ${name}
                </div>
                <div class="col">
                  <span id="current-seeker">00:00</span> / ${convertDuration(
                    duration
                  )}
                </div>`;
  player.innerHTML = html;
};

const updateProgressHTML = (currentTime, duration) => {
  const progress = Math.floor((currentTime / duration) * 100);
  const bar = $("player-progress");
  bar.innerHTML = progress + "%";
  bar.style.width = progress + "%";
  const seeker = $("current-seeker");
  seeker.innerHTML = convertDuration(currentTime);
};

ipcRenderer.on("get-tracks", (event, tracks) => {
  allTracks = tracks;
  renderListHTML(tracks);
});

musicAudio.addEventListener("loadedmetadata", () => {
  renderPlayerHTML(currentTrack.fileName, musicAudio.duration);
});
musicAudio.addEventListener("timeupdate", () => {
  updateProgressHTML(musicAudio.currentTime, musicAudio.duration);
});

$("tracks-list").addEventListener("click", (event) => {
  event.preventDefault();
  const { dataset, classList } = event.target;
  const id = dataset && dataset.id;
  if (id && classList.contains("fa-play")) {
    // play music
    if (currentTrack && currentTrack.id === id) {
      musicAudio.play();
    } else {
      currentTrack = allTracks.find((track) => track.id === id);
      musicAudio.src = currentTrack.path;
      musicAudio.play();
      const resetIconEle = document.querySelector(".fa-pause");
      if (resetIconEle) {
        resetIconEle.classList.replace("fa-pause", "fa-play");
      }
    }
    classList.replace("fa-play", "fa-pause");
  } else if (classList.contains("fa-pause")) {
    // pause music
    musicAudio.pause();
    classList.replace("fa-pause", "fa-play");
  } else if (classList.contains("fa-trash-can")) {
    // delete music
    if (currentTrack && currentTrack.id === id) {
      musicAudio.pause();
    }
    ipcRenderer.send("delete-track", id);
  }
});
