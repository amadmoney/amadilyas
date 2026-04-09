const tabs = document.querySelectorAll(".tab-btn");
const wipe = document.getElementById("transitionWipe");
const newsCopy = document.getElementById("newsCopy");

const tabContent = {
  archive: `
	<div class="news-copy-entry">Archive selected. Real player shell swapped into the main display.</div>
	<div class="news-copy-entry">Mini player module moved into the lower right rail with a cheeky little download button.</div>
	<div class="news-copy-entry">Use this box for current status notes, updates, now-playing blurbs, or site logs.</div>
  `,
  thoughts: `
	<div class="news-copy-entry">Thoughts selected. Use this area for reviews, fragments, diary lines, and unfinished ideas.</div>
	<div class="news-copy-entry">This lower rail can also become a live feed of recent writing or pinned notes.</div>
	<div class="news-copy-entry">Could be nice to rotate these entries depending on the selected tab.</div>
  `,
  words: `
	<div class="news-copy-entry">Words tab is currently a placeholder.</div>
	<div class="news-copy-entry">Add a matching panel in the HTML if you want this tab to open real content.</div>
	<div class="news-copy-entry">Right now the button still updates this lower text rail.</div>
  `,
  ephemera: `
	<div class="news-copy-entry">Ephemera tab is currently a placeholder.</div>
	<div class="news-copy-entry">You can wire this to a future panel, project feed, or external page state.</div>
	<div class="news-copy-entry">For now it only updates the lower signal box.</div>
  `,
  contact: `
	<div class="news-copy-entry">Contact selected. Keep this playful and still part of the device world.</div>
	<div class="news-copy-entry">Good spot for email, socials, rep info, or downloadable deck links.</div>
	<div class="news-copy-entry">This section already has the contact panel in the screen area.</div>
  `,
  amad: `
	<div class="news-copy-entry">Amad selected. This can become the personal operating-system layer.</div>
	<div class="news-copy-entry">Think bio, orbiting references, timeline fragments, or personal lore.</div>
	<div class="news-copy-entry">This section already has a live visual panel in the screen area.</div>
  `
};

let current = "archive";

function switchPanel(target) {
  if (target === current) return;

  const currentPanel = document.querySelector(`.screen-panel[data-panel="${current}"]`);
  const nextPanel = document.querySelector(`.screen-panel[data-panel="${target}"]`);
  if (!currentPanel || !nextPanel) return;

  const currentIndex = [...tabs].findIndex(tab => tab.dataset.target === current);
  const nextIndex = [...tabs].findIndex(tab => tab.dataset.target === target);
  const movingForward = nextIndex > currentIndex;

  currentPanel.classList.remove("active", "exit-left", "exit-right");
  nextPanel.classList.remove("active", "exit-left", "exit-right");
  currentPanel.classList.add(movingForward ? "exit-left" : "exit-right");

  if (wipe) {
	wipe.classList.remove("is-running");
	void wipe.offsetWidth;
	wipe.classList.add("is-running");
  }

  setTimeout(() => {
	currentPanel.classList.remove("active", "exit-left", "exit-right");
	nextPanel.classList.add("active");
  }, 120);

  current = target;
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
	const target = tab.dataset.target;

	tabs.forEach(btn => {
	  btn.classList.toggle("active", btn.dataset.target === target);
	});

	if (newsCopy && tabContent[target]) {
	  newsCopy.innerHTML = tabContent[target];
	}

	if (document.querySelector(`.screen-panel[data-panel="${target}"]`)) {
	  switchPanel(target);
	}
  });
});

const audio = document.getElementById("audio");

const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const muteBtn = document.getElementById("muteBtn");
const volUpBtn = document.getElementById("volUpBtn");
const volDownBtn = document.getElementById("volDownBtn");

const playIcon = document.getElementById("playIcon");
const muteIcon = document.getElementById("muteIcon");

const trackTitleText = document.getElementById("trackTitleText");
const trackArtist = document.getElementById("trackArtist");
const trackCount = document.getElementById("trackCount");

const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const progressThumb = document.getElementById("progressThumb");

const miniPlayBtn = document.getElementById("miniPlayBtn");
const miniPrevBtn = document.getElementById("miniPrevBtn");
const miniNextBtn = document.getElementById("miniNextBtn");
const miniMuteBtn = document.getElementById("miniMuteBtn");

const miniPlayIcon = document.getElementById("miniPlayIcon");
const miniMuteIcon = document.getElementById("miniMuteIcon");
const miniPlayerStatus = document.getElementById("miniPlayerStatus");
const miniPlayerTrack = document.getElementById("miniPlayerTrack");
const miniPlayerMeta = document.getElementById("miniPlayerMeta");

const lcdPet = document.getElementById("lcdPet");
const lcdPetImg = document.getElementById("lcdPetImg");

const HERO_PLAY_ICON =
  "https://raw.githubusercontent.com/amadmoney/amadilyas/8000217d27783ba6002b8d7cdeb27b1502a003e2/icons/play-solid-full.svg";
const HERO_PAUSE_ICON =
  "https://raw.githubusercontent.com/amadmoney/amadilyas/8000217d27783ba6002b8d7cdeb27b1502a003e2/icons/pause-solid-full.svg";

const MINI_PLAY_ICON =
  "https://raw.githubusercontent.com/amadmoney/amadilyas/8000217d27783ba6002b8d7cdeb27b1502a003e2/icons/play-solid-full.svg";
const MINI_PAUSE_ICON =
  "https://raw.githubusercontent.com/amadmoney/amadilyas/8000217d27783ba6002b8d7cdeb27b1502a003e2/icons/pause-solid-full.svg";

const MUTE_ICON =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236a6a72'><path d='M14 3.23v17.54c0 .45-.54.67-.85.35L8.77 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3.77l4.38-4.12c.31-.32.85-.1.85.35z'/><path d='M16.5 9.5 21 14m0-4.5L16.5 14' stroke='%236a6a72' stroke-width='2' stroke-linecap='round'/></svg>";
const VOLUME_ICON =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236a6a72'><path d='M14 3.23v17.54c0 .45-.54.67-.85.35L8.77 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3.77l4.38-4.12c.31-.32.85-.1.85.35z'/><path d='M17 9.5a4 4 0 0 1 0 5' stroke='%236a6a72' stroke-width='2' stroke-linecap='round' fill='none'/><path d='M19 7a7.5 7.5 0 0 1 0 10' stroke='%236a6a72' stroke-width='2' stroke-linecap='round' fill='none'/></svg>";

let tracks = [];
let currentTrackIndex = 0;
let hasStarted = false;
let isScrubbing = false;

function formatTime(time) {
  if (!Number.isFinite(time)) return "0:00";
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function updatePlayIcons() {
  if (playIcon) {
	playIcon.src = audio && audio.paused ? HERO_PLAY_ICON : HERO_PAUSE_ICON;
  }

  if (miniPlayIcon) {
	miniPlayIcon.src = audio && audio.paused ? MINI_PLAY_ICON : MINI_PAUSE_ICON;
  }
}

function updateMuteIcons() {
  if (!audio) return;

  if (muteIcon) {
	muteIcon.src = audio.muted ? MUTE_ICON : VOLUME_ICON;
  }

  if (miniMuteIcon) {
	miniMuteIcon.src = audio.muted ? MUTE_ICON : VOLUME_ICON;
  }
}

function updateTrackUI() {
  if (!tracks.length) return;

  const track = tracks[currentTrackIndex];
  if (!track) return;

  if (trackTitleText) trackTitleText.textContent = track.title;
  if (trackArtist) trackArtist.textContent = track.artist;
  if (trackCount) trackCount.textContent = `${currentTrackIndex + 1}/${tracks.length}`;

  syncMiniPlayer();
}

function updateProgress() {
  if (!audio) return;

  const duration = audio.duration || 0;
  const currentTime = audio.currentTime || 0;
  const percent = duration ? (currentTime / duration) * 100 : 0;

  if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
  if (durationEl) durationEl.textContent = formatTime(duration);
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressThumb) progressThumb.style.left = `${percent}%`;
}

function syncMiniPlayer() {
  if (!audio) return;

  if (miniPlayerStatus) {
	miniPlayerStatus.textContent = audio.paused ? "PAUSED" : "PLAYING";
  }

  if (miniPlayerTrack && trackTitleText) {
	miniPlayerTrack.textContent = trackTitleText.textContent || "archive signal";
  }

  if (miniPlayerMeta && trackArtist) {
	miniPlayerMeta.textContent = trackArtist.textContent || "artist";
  }

  updatePlayIcons();
  updateMuteIcons();
}

function updatePetState() {
  if (!lcdPet || !lcdPetImg || !audio) return;

  if (audio.paused) {
	lcdPet.style.animationPlayState = "paused";
	lcdPetImg.style.transform = "scale(1)";
  } else {
	lcdPet.style.animationPlayState = "running";
	lcdPetImg.style.transform = "scale(1)";
  }
}

function loadTrack(index, shouldAutoplay = false) {
  if (!tracks.length || !audio) return;

  currentTrackIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrackIndex];
  if (!track) return;

  audio.src = track.audio;
  audio.load();

  updateTrackUI();
  updateProgress();
  updatePlayIcons();
  updateMuteIcons();
  updatePetState();

  if (shouldAutoplay) {
	audio.play().catch(error => {
	  console.error("Playback failed:", error);
	});
  }
}

function playCurrent() {
  if (!audio || !tracks.length) return;

  if (!hasStarted) {
	currentTrackIndex = Math.floor(Math.random() * tracks.length);
	hasStarted = true;
	loadTrack(currentTrackIndex, true);
	return;
  }

  if (audio.paused) {
	audio.play().catch(error => {
	  console.error("Playback failed:", error);
	});
  } else {
	audio.pause();
  }
}

function playNext() {
  if (!tracks.length) return;

  if (!hasStarted) {
	hasStarted = true;
	loadTrack(currentTrackIndex + 1, true);
	return;
  }

  loadTrack(currentTrackIndex + 1, true);
}

function playPrev() {
  if (!audio || !tracks.length) return;

  if (!hasStarted) {
	hasStarted = true;
	loadTrack(currentTrackIndex - 1, true);
	return;
  }

  if (audio.currentTime > 3) {
	audio.currentTime = 0;
	updateProgress();
	return;
  }

  loadTrack(currentTrackIndex - 1, true);
}

function changeVolume(delta) {
  if (!audio) return;

  audio.volume = Math.max(0, Math.min(1, audio.volume + delta));

  if (audio.volume > 0 && audio.muted) {
	audio.muted = false;
  }

  updateMuteIcons();
}

function toggleMute() {
  if (!audio) return;

  audio.muted = !audio.muted;
  updateMuteIcons();
  syncMiniPlayer();
}

function seekFromClientX(clientX) {
  if (!progressBar || !audio || !audio.duration) return;

  const rect = progressBar.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  audio.currentTime = percent * audio.duration;
  updateProgress();
}

async function loadPlaylist() {
  try {
	const response = await fetch("./playlist.json", { cache: "no-store" });

	if (!response.ok) {
	  throw new Error(`HTTP ${response.status}`);
	}

	const data = await response.json();

	if (!Array.isArray(data) || data.length === 0) {
	  throw new Error("Playlist is empty or invalid.");
	}

	const validTracks = data.filter(track =>
	  track &&
	  typeof track.title === "string" &&
	  typeof track.artist === "string" &&
	  typeof track.audio === "string" &&
	  track.title.trim() !== "" &&
	  track.artist.trim() !== "" &&
	  track.audio.trim() !== ""
	);

	if (!validTracks.length) {
	  throw new Error("No valid tracks found in playlist.json.");
	}

	tracks = validTracks;
	currentTrackIndex = 0;

	loadTrack(currentTrackIndex, false);
	syncMiniPlayer();
  } catch (error) {
	console.error("Failed to load playlist:", error);

	if (trackTitleText) trackTitleText.textContent = "playlist error";
	if (trackArtist) trackArtist.textContent = "check playlist.json";
	if (trackCount) trackCount.textContent = "0/0";

	if (miniPlayerStatus) miniPlayerStatus.textContent = "ERROR";
	if (miniPlayerTrack) miniPlayerTrack.textContent = "playlist error";
	if (miniPlayerMeta) miniPlayerMeta.textContent = "check playlist.json";
  }
}

playBtn?.addEventListener("click", playCurrent);
nextBtn?.addEventListener("click", playNext);
prevBtn?.addEventListener("click", playPrev);
muteBtn?.addEventListener("click", toggleMute);
volUpBtn?.addEventListener("click", () => changeVolume(0.1));
volDownBtn?.addEventListener("click", () => changeVolume(-0.1));

miniPlayBtn?.addEventListener("click", () => {
  playBtn?.click();
});

miniPrevBtn?.addEventListener("click", () => {
  prevBtn?.click();
});

miniNextBtn?.addEventListener("click", () => {
  nextBtn?.click();
});

miniMuteBtn?.addEventListener("click", () => {
  muteBtn?.click();
});

progressBar?.addEventListener("pointerdown", event => {
  isScrubbing = true;
  seekFromClientX(event.clientX);
});

window.addEventListener("pointermove", event => {
  if (!isScrubbing) return;
  seekFromClientX(event.clientX);
});

window.addEventListener("pointerup", () => {
  isScrubbing = false;
});

audio?.addEventListener("timeupdate", () => {
  updateProgress();
});

audio?.addEventListener("loadedmetadata", () => {
  updateProgress();
  syncMiniPlayer();
});

audio?.addEventListener("play", () => {
  updatePlayIcons();
  syncMiniPlayer();
  updatePetState();
});

audio?.addEventListener("pause", () => {
  updatePlayIcons();
  syncMiniPlayer();
  updatePetState();
});

audio?.addEventListener("volumechange", () => {
  updateMuteIcons();
  syncMiniPlayer();
});

audio?.addEventListener("ended", () => {
  playNext();
});

audio?.addEventListener("error", () => {
  console.error("Audio failed to load:", audio.currentSrc);
});

if (audio) {
  audio.volume = 0.7;
}

loadPlaylist();