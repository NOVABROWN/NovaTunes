// Enhanced music player script with dynamic playlist and duration display
console.log("🎵 NovaTunes JS loaded!");
let currentIndex = 0;
let songs = [];

const audio = new Audio();
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.querySelector('.cover');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const volumeSlider = document.getElementById('volume');
const progressBar = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const toggleBtn = document.getElementById('togglePlayPause');
const playPauseIcon = document.getElementById('playPauseIcon');
const searchInput = document.getElementById("searchInput");

fetchAllSongs();

function loadSong(index) {
  const song = songs[index];
  audio.src = song.src;
  title.textContent = song.title;
  artist.textContent = song.artist;
  cover.src = song.cover;
  audio.play();
  updatePlayIcon(true);
}

function playSong(song) {
  console.log("Now playing:", song.src);
  audio.src = song.src;
  audio.play().catch(e => console.error("Audio play failed:", e));
  title.textContent = song.title;
  artist.textContent = song.artist;
  cover.src = song.cover;
  currentIndex = songs.findIndex(s => s.src === song.src);
  updatePlayIcon(true);
}

function pauseSong() {
  audio.pause();
  updatePlayIcon(false);
}

function togglePlay() {
  if (audio.paused) {
    playSong(songs[currentIndex]);
  } else {
    pauseSong();
  }
}

function updatePlayIcon(isPlaying) {
  if (playPauseIcon) {
    playPauseIcon.src = isPlaying
      ? "https://cdn-icons-png.flaticon.com/512/727/727245.png"
      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjIWN9Wh2Nr651IvNzeAOFMfy3BR0pQUfncg&s";
  }
}

function nextSong() {
  currentIndex = (currentIndex + 1) % songs.length;
  loadSong(currentIndex);
}

function prevSong() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
}

function renderFeatured(songsToRender) {
  const featuredSection = document.getElementById("featured-section");
  featuredSection.innerHTML = "";
  songsToRender.slice(0, 5).forEach(song => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${song.cover}" alt="${song.title} Cover" />
      <h4>${song.title}</h4>
      <p>${song.artist}</p>
    `;
    card.addEventListener("click", () => playSong(song));
    featuredSection.appendChild(card);
  });
}

function renderArtists(songsToRender) {
  const artistsSection = document.getElementById("artists-section");
  artistsSection.innerHTML = "";
  const uniqueArtists = [...new Map(songsToRender.map(item => [item.artist, item])).values()];
  uniqueArtists.forEach(artist => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${artist.cover}" alt="${artist.artist} Image" />
      <h4>${artist.artist}</h4>
    `;
    artistsSection.appendChild(card);
  });
}

function renderPlaylist() {
  const playlist = document.getElementById("playlist");
  if (!playlist) return;
  playlist.innerHTML = "";
  songs.forEach((song, index) => {
    const item = document.createElement("div");
    item.classList.add("playlist-item");
    item.innerHTML = `<p>${song.title} - ${song.artist}</p>`;
    item.addEventListener("click", () => {
      currentIndex = index;
      loadSong(index);
    });
    playlist.appendChild(item);
  });
}

// Progress bar
audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
  }
});

progressBar.addEventListener("input", () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Event Listeners
toggleBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});
audio.addEventListener("ended", () => {
  updatePlayIcon(false);
});

// Search
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  fetch(`http://localhost:3000/api/songs/search?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        renderFeatured(data);
        renderArtists(data);
      } else {
        document.getElementById("featured-section").innerHTML = "<p>No results found.</p>";
        document.getElementById("artists-section").innerHTML = "";
      }
    })
    .catch(err => console.error("Search error:", err));
});

// Fetch All Songs
async function fetchAllSongs() {
  try {
    const res = await fetch('http://localhost:3000/api/songs');
    const data = await res.json();
    songs = data.results || data; // if pagination is used
    renderFeatured(songs);
    renderArtists(songs);
    renderPlaylist();
    if (songs.length > 0) {
      playSong(songs[0]);
    }
  } catch (err) {
    console.error('Error loading songs:', err);
  }
}
