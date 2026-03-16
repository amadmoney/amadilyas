const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const volUpBtn = document.getElementById("volUpBtn");
const volDownBtn = document.getElementById("volDownBtn");
const muteBtn = document.getElementById("muteBtn");

const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const trackCount = document.getElementById("trackCount");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const progressThumb = document.getElementById("progressThumb");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

let playlist = [];
let currentTrackIndex = 0;
let isScrubbing = false;
audio.volume = 0.7;

function formatTime(time) {
  if (!isFinite(time)) return "0:00";
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function updatePlayButton() {
  const icon = playBtn.querySelector("i");
  if (!icon) return;
  icon.className = audio.paused ? "fa-solid fa-play" : "fa-solid fa-pause";
}

function updateMuteButton() {
  muteBtn.textContent = audio.muted ? "sound" : "mute";
}

function updateProgressUI(current, total) {
  const percent = total ? (current / total) * 100 : 0;
  progressFill.style.width = `${percent}%`;
  progressThumb.style.left = `${percent}%`;
  progressBar.setAttribute("aria-valuenow", Math.round(percent));
  currentTime.textContent = formatTime(current);
  duration.textContent = formatTime(total);
}

function loadTrack(index, autoplay = false) {
  if (!playlist.length) return;

  currentTrackIndex = index;
  const track = playlist[currentTrackIndex];

  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  trackCount.textContent = `${currentTrackIndex + 1}/${playlist.length}`;

  audio.src = track.audio;
  audio.load();

  updateProgressUI(0, 0);

  if (autoplay) {
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(updatePlayButton).catch(updatePlayButton);
    }
  } else {
    updatePlayButton();
  }
}

function scrubToClientX(clientX) {
  if (!audio.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  audio.currentTime = ratio * audio.duration;
  updateProgressUI(audio.currentTime, audio.duration);
}

async function fetchPlaylist() {
  try {
    const response = await fetch("playlist.json");
    if (!response.ok) throw new Error("Playlist file not found");
    playlist = await response.json();
  } catch (error) {
    console.error(error);
    playlist = [
      { title: "TRACK ONE", artist: "ARTIST ONE", audio: "music/track-01.mp3" },
      { title: "TRACK TWO", artist: "ARTIST TWO", audio: "music/track-02.mp3" },
      { title: "TRACK THREE", artist: "ARTIST THREE", audio: "music/track-03.mp3" }
    ];
  }

  loadTrack(0, false);
}

playBtn.addEventListener("click", async () => {
  if (!audio.src) return;

  try {
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  } catch (err) {
    console.error(err);
  }

  updatePlayButton();
});

prevBtn.addEventListener("click", () => {
  if (!playlist.length) return;
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex, true);
});

nextBtn.addEventListener("click", () => {
  if (!playlist.length) return;
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex, true);
});

volUpBtn.addEventListener("click", () => {
  audio.volume = Math.min(1, +(audio.volume + 0.1).toFixed(2));
  if (audio.volume > 0) audio.muted = false;
  updateMuteButton();
});

volDownBtn.addEventListener("click", () => {
  audio.volume = Math.max(0, +(audio.volume - 0.1).toFixed(2));
  if (audio.volume > 0) audio.muted = false;
  updateMuteButton();
});

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  updateMuteButton();
});

audio.addEventListener("loadedmetadata", () => {
  updateProgressUI(audio.currentTime, audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!isScrubbing) {
    updateProgressUI(audio.currentTime, audio.duration || 0);
  }
});

audio.addEventListener("play", updatePlayButton);
audio.addEventListener("pause", updatePlayButton);

audio.addEventListener("ended", () => {
  if (!playlist.length) return;
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex, true);
});

progressBar.addEventListener("pointerdown", (event) => {
  isScrubbing = true;
  progressBar.setPointerCapture(event.pointerId);
  scrubToClientX(event.clientX);
});

progressBar.addEventListener("pointermove", (event) => {
  if (!isScrubbing) return;
  scrubToClientX(event.clientX);
});

progressBar.addEventListener("pointerup", (event) => {
  if (!isScrubbing) return;
  scrubToClientX(event.clientX);
  isScrubbing = false;
  progressBar.releasePointerCapture(event.pointerId);
});

progressBar.addEventListener("pointercancel", (event) => {
  isScrubbing = false;
  try {
    progressBar.releasePointerCapture(event.pointerId);
  } catch (err) {}
});

progressBar.addEventListener("keydown", (event) => {
  if (!audio.duration) return;

  const step = Math.max(5, audio.duration * 0.02);

  if (event.key === "ArrowRight") {
    event.preventDefault();
    audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    audio.currentTime = Math.max(0, audio.currentTime - step);
  }

  updateProgressUI(audio.currentTime, audio.duration);
});

updateMuteButton();
fetchPlaylist();
