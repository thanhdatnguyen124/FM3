const audio = document.getElementById("audio");
const player = document.getElementById("player");
const playBtn = document.getElementById("play");
const rewindBtn = document.getElementById("rewind");
const forwardBtn = document.getElementById("forward");
const closeBtn = document.getElementById("close");
const progress = document.getElementById("progress");

const title = document.getElementById("player-title");
const artist = document.getElementById("player-artist");
const cover = document.getElementById("player-cover");

// Search related elements (restored)
const searchInput = document.getElementById("searchInput");
const musicCards = document.querySelectorAll(".music-card");

// Player time elements (may not exist on all pages)
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

// click vào card nhạc
document.querySelectorAll(".music-card").forEach(card => {
  card.addEventListener("click", () => {
    audio.src = card.dataset.music;
    cover.src = card.querySelector("img").src;
    title.innerText = card.querySelector("h4").innerText;
    artist.innerText = card.querySelector("p").innerText;

    player.classList.remove("hidden");
    audio.play();
    playBtn.innerText = "⏸";
  });
});

// play / pause
if (playBtn) {
  playBtn.onclick = () => {
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      playBtn.innerText = "⏸";
    } else {
      audio.pause();
      playBtn.innerText = "▶";
    }
  };
}

// Tua, progress và đóng player — thiết lập an toàn nếu phần tử tồn tại
if (audio) {
  if (rewindBtn) rewindBtn.onclick = () => audio.currentTime = Math.max(0, (audio.currentTime || 0) - 10);
  if (forwardBtn) forwardBtn.onclick = () => audio.currentTime = Math.min(audio.duration || 0, (audio.currentTime || 0) + 10);

  audio.onended = () => { if (playBtn) playBtn.innerText = "▶"; };

  audio.ontimeupdate = () => {
    if (progress) progress.value = (audio.currentTime / audio.duration) * 100 || 0;
    if (currentTimeEl) currentTimeEl.innerText = formatTime(audio.currentTime);
    if (durationEl) durationEl.innerText = formatTime(audio.duration);
  };

  if (progress) {
    progress.oninput = () => { audio.currentTime = (progress.value / 100) * (audio.duration || 0); };
  }

  if (closeBtn) {
    closeBtn.onclick = () => { audio.pause(); if (player) player.classList.add('hidden'); };
  }
} else {
  // No audio on this page — make sure button handlers don't throw
  if (playBtn) playBtn.onclick = null;
  if (rewindBtn) rewindBtn.onclick = null;
  if (forwardBtn) forwardBtn.onclick = null;
  if (closeBtn) closeBtn.onclick = null;
}

// Add overlays and favorite buttons
(function addCardOverlays(){
  const stored = JSON.parse(localStorage.getItem('favs')||'[]');
  document.querySelectorAll('.music-card').forEach(card=>{
    // overlay container
    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';

    const fav = document.createElement('button');
    fav.className = 'fav';
    fav.setAttribute('aria-label','favorite');
    fav.innerText = '♡';

    const playOverlay = document.createElement('div');
    playOverlay.className = 'card-play';
    playOverlay.setAttribute('aria-hidden','true');
    playOverlay.innerText = '▶';

    overlay.appendChild(fav);
    overlay.appendChild(playOverlay);
    card.appendChild(overlay);

    if(stored.includes(card.dataset.music)){
      fav.classList.add('active');
      fav.innerText = '♥';
    }

    fav.addEventListener('click', e=>{
      e.stopPropagation();
      fav.classList.toggle('active');
      fav.innerText = fav.classList.contains('active') ? '♥' : '♡';
      const id = card.dataset.music;
      const list = JSON.parse(localStorage.getItem('favs')||'[]');
      if(fav.classList.contains('active')){
        if(!list.includes(id)) list.push(id);
      } else {
        const i = list.indexOf(id);
        if(i>=0) list.splice(i,1);
      }
      localStorage.setItem('favs', JSON.stringify(list));
    });

    playOverlay.addEventListener('click', e=>{
      e.stopPropagation();
      card.click();
    });
  });
})();

// Time display & keyboard shortcuts

function formatTime(s){
  if(!s || isNaN(s)) return '0:00';
  const m = Math.floor(s/60);
  const sec = Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

audio.ontimeupdate = () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  if(currentTimeEl) currentTimeEl.innerText = formatTime(audio.currentTime);
  if(durationEl) durationEl.innerText = formatTime(audio.duration);
};
audio.onloadedmetadata = ()=> { if(durationEl) durationEl.innerText = formatTime(audio.duration); };

// keyboard controls
document.addEventListener('keydown', e=>{
  if(document.activeElement && document.activeElement.tagName === 'INPUT') return;
  if(e.code === 'Space'){ e.preventDefault(); if(playBtn) playBtn.click(); }
  if(e.code === 'ArrowLeft'){ if(audio) audio.currentTime = Math.max(0, (audio.currentTime || 0) - 10); }
  if(e.code === 'ArrowRight'){ if(audio) audio.currentTime = Math.min(audio.duration||0, (audio.currentTime || 0) + 10); }
});
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();

    musicCards.forEach(card => {
      const title = card.querySelector("h4").innerText.toLowerCase();

      if (title.includes(keyword)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}




