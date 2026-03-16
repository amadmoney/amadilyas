const playlist = [
  { title: "TRACK ONE", artist: "ARTIST ONE", audio: "music/track-01.mp3" },
  { title: "TRACK TWO", artist: "ARTIST TWO", audio: "music/track-02.mp3" },
  { title: "TRACK THREE", artist: "ARTIST THREE", audio: "music/track-03.mp3" }
];

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
const progressFill = document.getElementById("progressFill");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const floatingPlayer = document.getElementById("floatingPlayer");
const playerTilt = document.getElementById("playerTilt");

let currentTrackIndex = 0;
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

function loadTrack(index, autoplay = false) {
  currentTrackIndex = index;
  const track = playlist[currentTrackIndex];

  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  trackCount.textContent = `${currentTrackIndex + 1}/${playlist.length}`;

  audio.src = track.audio;
  audio.load();

  currentTime.textContent = "0:00";
  duration.textContent = "0:00";
  progressFill.style.width = "0%";

  if (autoplay) {
    const p = audio.play();
    if (p) {
      p.then(() => {
        updatePlayButton();
      }).catch(() => {
        updatePlayButton();
      });
    }
  } else {
    updatePlayButton();
  }
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
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex, true);
});

nextBtn.addEventListener("click", () => {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex, true);
});

volUpBtn.addEventListener("click", () => {
  audio.volume = Math.min(1, +(audio.volume + 0.1).toFixed(2));
});

volDownBtn.addEventListener("click", () => {
  audio.volume = Math.max(0, +(audio.volume - 0.1).toFixed(2));
});

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  updateMuteButton();
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = `${percent}%`;
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("play", updatePlayButton);
audio.addEventListener("pause", updatePlayButton);

audio.addEventListener("ended", () => {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex, true);
});

function handleTilt(event) {
  const rect = floatingPlayer.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) - 0.5;
  const y = ((event.clientY - rect.top) / rect.height) - 0.5;

  const rotateY = x * 10;
  const rotateX = y * -8;

  playerTilt.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function resetTilt() {
  playerTilt.style.transform = "rotateX(0deg) rotateY(0deg)";
}

if (window.matchMedia("(pointer:fine)").matches) {
  floatingPlayer.addEventListener("mousemove", handleTilt);
  floatingPlayer.addEventListener("mouseleave", resetTilt);
}

updateMuteButton();
loadTrack(0, false);
