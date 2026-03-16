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

const muteIcon = muteBtn?.querySelector("img");

const lcdPet = document.getElementById("lcdPet");
const lcdPetImg = document.getElementById("lcdPetImg");
const lcdPetWrap = document.querySelector(".lcd-pet-wrap");
const lcdPetShadow = document.querySelector(".lcd-pet-shadow");
const lcdIdleEvents = document.getElementById("lcdIdleEvents");
const lcdWorld = document.querySelector(".lcd-world");

const MUTE_ICON_SRC =
  "https://raw.githubusercontent.com/amadmoney/amadilyas/934d11b9a53b22a6d5b25fe4d6f1947c28e0bd2c/icons/mute-solid-full.svg";

/* swap this later if you make a separate unmuted/sound icon */
const SOUND_ICON_SRC =
  "https://raw.githubusercontent.com/amadmoney/amadilyas/934d11b9a53b22a6d5b25fe4d6f1947c28e0bd2c/icons/mute-solid-full.svg";

let playlist = [];
let currentTrackIndex = 0;
let isScrubbing = false;
let lastVolumeBeforeMute = 0.7;

let sleepTimer = null;
let blinkTimer = null;
let idleEventTimer = null;
let chaseStarTimer = null;
let chaseCleanupTimer = null;
let petActionTimer = null;

audio.volume = 0.7;

/* create chase star automatically if it's not in the HTML */
let lcdChaseStar = document.querySelector(".lcd-chase-star");
if (!lcdChaseStar && lcdWorld) {
  lcdChaseStar = document.createElement("span");
  lcdChaseStar.className = "lcd-chase-star";
  lcdChaseStar.setAttribute("aria-hidden", "true");
  lcdWorld.appendChild(lcdChaseStar);
}

function formatTime(time) {
  if (!isFinite(time)) return "0:00";
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function updatePlayButton() {
  if (!playBtn) return;
  playBtn.setAttribute("aria-label", audio.paused ? "Play" : "Pause");
  playBtn.setAttribute("aria-pressed", String(!audio.paused));
}

function updateMuteButton() {
  if (muteIcon) {
    muteIcon.src = audio.muted || audio.volume === 0 ? MUTE_ICON_SRC : SOUND_ICON_SRC;
  }

  if (!muteBtn) return;

  muteBtn.setAttribute(
    "aria-label",
    audio.muted || audio.volume === 0 ? "Unmute" : "Mute"
  );

  muteBtn.setAttribute(
    "aria-pressed",
    String(audio.muted || audio.volume === 0)
  );
}

function updateProgressUI(current, total) {
  const percent = total ? (current / total) * 100 : 0;

  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressThumb) progressThumb.style.left = `${percent}%`;
  if (progressBar) progressBar.setAttribute("aria-valuenow", Math.round(percent));
  if (currentTime) currentTime.textContent = formatTime(current);
  if (duration) duration.textContent = formatTime(total);
}

function clearPetStates() {
  if (!lcdPet || !lcdPetWrap || !lcdPetShadow || !lcdPetImg) return;

  lcdPet.classList.remove("pet-idle", "pet-dance", "pet-jump", "pet-sleep");
  lcdPetWrap.classList.remove("is-sleeping", "is-chasing");
  lcdPetShadow.classList.remove("pet-shadow-bounce", "pet-shadow-dance", "is-sleeping");
  lcdPetImg.classList.remove("pet-blink");
}

function startPetIdle() {
  if (!lcdPet || !lcdPetShadow || !lcdPetWrap) return;
  clearPetStates();
  lcdPet.classList.add("pet-idle");
  lcdPetShadow.classList.add("pet-shadow-bounce");
}

function startPetDance() {
  if (!lcdPet || !lcdPetShadow || !lcdPetWrap) return;
  clearPetStates();
  lcdPet.classList.add("pet-dance");
  lcdPetShadow.classList.add("pet-shadow-dance");
}

function startPetSleep() {
  if (!lcdPet || !lcdPetWrap || !lcdPetShadow) return;
  clearPetStates();
  lcdPet.classList.add("pet-sleep");
  lcdPetWrap.classList.add("is-sleeping");
  lcdPetShadow.classList.add("is-sleeping");
}

function clearSleepTimer() {
  if (sleepTimer) {
    clearTimeout(sleepTimer);
    sleepTimer = null;
  }
}

function startSleepTimer() {
  clearSleepTimer();

  if (!audio.paused) return;

  sleepTimer = setTimeout(() => {
    if (audio.paused) {
      startPetSleep();
    }
  }, 30000);
}

function clearPetActionTimer() {
  if (petActionTimer) {
    clearTimeout(petActionTimer);
    petActionTimer = null;
  }
}

function petJump() {
  if (!lcdPet) return;

  clearPetActionTimer();
  clearPetStates();
  lcdPet.classList.add("pet-jump");

  petActionTimer = setTimeout(() => {
    lcdPet.classList.remove("pet-jump");

    if (audio.paused) {
      startPetIdle();
      startSleepTimer();
    } else {
      startPetDance();
    }
  }, 560);
}

function scheduleBlink() {
  if (!lcdPetImg) return;

  const delay = 2200 + Math.random() * 2800;

  blinkTimer = setTimeout(() => {
    lcdPetImg.classList.add("pet-blink");

    setTimeout(() => {
      lcdPetImg.classList.remove("pet-blink");
      scheduleBlink();
    }, 450);
  }, delay);
}

function initBlinking() {
  if (blinkTimer) {
    clearTimeout(blinkTimer);
    blinkTimer = null;
  }
  scheduleBlink();
}

function reactPetToVolume() {
  if (!lcdPet) return;

  const effectiveVolume = audio.muted ? 0 : audio.volume;
  const glow = effectiveVolume > 0
    ? `drop-shadow(0 0 ${2 + effectiveVolume * 4}px rgba(255,255,255,0.16))`
    : "none";

  lcdPet.style.filter = glow;
}

/* =========================
   IDLE EVENTS
========================= */

function spawnIdleEvent(typeOverride = null) {
  if (!lcdIdleEvents) return;

  const types = ["heart", "star", "bubble"];
  const type = typeOverride || types[Math.floor(Math.random() * types.length)];

  const event = document.createElement("span");
  event.className = `lcd-idle-event ${type}`;

  const x = Math.random() * 70 + 12;
  const y = Math.random() * 42 + 14;

  event.style.left = `${x}%`;
  event.style.top = `${y}%`;

  lcdIdleEvents.appendChild(event);

  setTimeout(() => {
    event.remove();
  }, 1600);
}

function clearIdleEventLoop() {
  if (idleEventTimer) {
    clearTimeout(idleEventTimer);
    idleEventTimer = null;
  }
}

function scheduleIdleEventLoop() {
  clearIdleEventLoop();

  const delay = audio.paused
    ? 1800 + Math.random() * 3200
    : 2800 + Math.random() * 5200;

  idleEventTimer = setTimeout(() => {
    const pausedTypes = ["bubble", "star", "heart"];
    const playingTypes = ["star", "heart", "bubble"];
    const pool = audio.paused ? pausedTypes : playingTypes;
    const type = pool[Math.floor(Math.random() * pool.length)];

    spawnIdleEvent(type);
    scheduleIdleEventLoop();
  }, delay);
}

function restartIdleEventLoop() {
  clearIdleEventLoop();
  scheduleIdleEventLoop();
}

function burstIdleEvents(count = 3) {
  for (let i = 0; i < count; i += 1) {
    setTimeout(() => {
      spawnIdleEvent();
    }, i * 140);
  }
}

/* =========================
   CHASE STAR
========================= */

function clearChaseTimers() {
  if (chaseStarTimer) {
    clearTimeout(chaseStarTimer);
    chaseStarTimer = null;
  }
  if (chaseCleanupTimer) {
    clearTimeout(chaseCleanupTimer);
    chaseCleanupTimer = null;
  }
}

function stopChaseStar() {
  if (lcdPetWrap) {
    lcdPetWrap.classList.remove("is-chasing");
  }

  if (lcdChaseStar) {
    lcdChaseStar.classList.remove("is-active");
    void lcdChaseStar.offsetWidth;
  }
}

function triggerChaseStar() {
  if (!lcdChaseStar || !lcdPetWrap || !lcdPet || audio.paused) return;
  if (lcdPetWrap.classList.contains("is-sleeping")) return;

  lcdPetWrap.classList.add("is-chasing");

  lcdChaseStar.classList.remove("is-active");
  void lcdChaseStar.offsetWidth;
  lcdChaseStar.classList.add("is-active");

  lcdPet.classList.remove("pet-idle");
  lcdPet.classList.add("pet-dance");

  chaseCleanupTimer = setTimeout(() => {
    if (lcdPetWrap) lcdPetWrap.classList.remove("is-chasing");
    if (lcdChaseStar) lcdChaseStar.classList.remove("is-active");

    if (!audio.paused) {
      startPetDance();
    }
  }, 2500);
}

function scheduleChaseStar() {
  clearChaseTimers();

  if (audio.paused) return;

  const delay = 7000 + Math.random() * 12000;

  chaseStarTimer = setTimeout(() => {
    if (!audio.paused) {
      triggerChaseStar();
    }
    scheduleChaseStar();
  }, delay);
}

function restartChaseStarLoop() {
  clearChaseTimers();
  if (!audio.paused) {
    scheduleChaseStar();
  }
}

/* =========================
   TRACK / AUDIO
========================= */

function loadTrack(index, autoplay = false) {
  if (!playlist.length) return;

  currentTrackIndex = index;
  const track = playlist[currentTrackIndex];

  if (trackTitle) trackTitle.textContent = track.title;
  if (trackArtist) trackArtist.textContent = track.artist;
  if (trackCount) trackCount.textContent = `${currentTrackIndex + 1}/${playlist.length}`;

  audio.src = track.audio;
  audio.load();

  updateProgressUI(0, 0);
  petJump();
  burstIdleEvents(2);
  stopChaseStar();

  if (autoplay) {
    const playPromise = audio.play();

    if (playPromise) {
      playPromise
        .then(() => {
          updatePlayButton();
          startPetDance();
          restartChaseStarLoop();
        })
        .catch(() => {
          updatePlayButton();
          startPetIdle();
          startSleepTimer();
        });
    }
  } else {
    updatePlayButton();
    startPetIdle();
    startSleepTimer();
  }

  restartIdleEventLoop();
}

function scrubToClientX(clientX) {
  if (!audio.duration || !progressBar) return;

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

/* =========================
   BUTTONS
========================= */

playBtn?.addEventListener("click", async () => {
  if (!audio.src) return;

  try {
    if (audio.paused) {
      await audio.play();
      burstIdleEvents(3);
    } else {
      audio.pause();
    }
  } catch (err) {
    console.error(err);
  }

  updatePlayButton();
});

prevBtn?.addEventListener("click", () => {
  if (!playlist.length) return;
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex, true);
});

nextBtn?.addEventListener("click", () => {
  if (!playlist.length) return;
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex, true);
});

volUpBtn?.addEventListener("click", () => {
  audio.volume = Math.min(1, +(audio.volume + 0.1).toFixed(2));

  if (audio.volume > 0) {
    audio.muted = false;
    lastVolumeBeforeMute = audio.volume;
  }

  updateMuteButton();
  reactPetToVolume();

  if (!audio.paused) {
    burstIdleEvents(1);
  }
});

volDownBtn?.addEventListener("click", () => {
  audio.volume = Math.max(0, +(audio.volume - 0.1).toFixed(2));

  if (audio.volume > 0) {
    audio.muted = false;
    lastVolumeBeforeMute = audio.volume;
  }

  if (audio.volume === 0) {
    audio.muted = true;
  }

  updateMuteButton();
  reactPetToVolume();
});

muteBtn?.addEventListener("click", () => {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    audio.volume = lastVolumeBeforeMute > 0 ? lastVolumeBeforeMute : 0.7;
  } else {
    lastVolumeBeforeMute = audio.volume > 0 ? audio.volume : 0.7;
    audio.muted = true;
  }

  updateMuteButton();
  reactPetToVolume();
});

/* =========================
   AUDIO EVENTS
========================= */

audio.addEventListener("loadedmetadata", () => {
  updateProgressUI(audio.currentTime, audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!isScrubbing) {
    updateProgressUI(audio.currentTime, audio.duration || 0);
  }
});

audio.addEventListener("play", () => {
  updatePlayButton();
  clearSleepTimer();
  if (lcdPetShadow) lcdPetShadow.classList.remove("is-sleeping");
  startPetDance();
  restartIdleEventLoop();
  restartChaseStarLoop();
});

audio.addEventListener("pause", () => {
  updatePlayButton();
  stopChaseStar();
  clearChaseTimers();
  startPetIdle();
  startSleepTimer();
  restartIdleEventLoop();
});

audio.addEventListener("volumechange", () => {
  updateMuteButton();
  reactPetToVolume();
});

audio.addEventListener("ended", () => {
  if (!playlist.length) return;
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex, true);
});

/* =========================
   PROGRESS BAR
========================= */

progressBar?.addEventListener("pointerdown", (event) => {
  isScrubbing = true;
  progressBar.setPointerCapture(event.pointerId);
  scrubToClientX(event.clientX);
});

progressBar?.addEventListener("pointermove", (event) => {
  if (!isScrubbing) return;
  scrubToClientX(event.clientX);
});

progressBar?.addEventListener("pointerup", (event) => {
  if (!isScrubbing) return;
  scrubToClientX(event.clientX);
  isScrubbing = false;
  progressBar.releasePointerCapture(event.pointerId);
});

progressBar?.addEventListener("pointercancel", (event) => {
  isScrubbing = false;
  try {
    progressBar.releasePointerCapture(event.pointerId);
  } catch (err) {
    console.error(err);
  }
});

progressBar?.addEventListener("keydown", (event) => {
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

/* =========================
   INIT
========================= */

updatePlayButton();
updateMuteButton();
startPetIdle();
startSleepTimer();
initBlinking();
reactPetToVolume();
restartIdleEventLoop();
fetchPlaylist();
