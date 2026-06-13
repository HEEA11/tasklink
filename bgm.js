document.addEventListener('DOMContentLoaded', function () {
  const bgm = document.querySelector('#bgm');
  if (!bgm) return;
  const savedTimeKey = 'heea-bgm-current-time';
  const savedAtKey = 'heea-bgm-saved-at';
  const playingKey = 'heea-bgm-was-playing';
  let restored = false;

  bgm.volume = 0.42;

  function restoreBgmTime() {
    if (restored) return;
    const savedTime = Number(sessionStorage.getItem(savedTimeKey));
    const savedAt = Number(sessionStorage.getItem(savedAtKey));
    const wasPlaying = sessionStorage.getItem(playingKey) === '1';

    if (Number.isFinite(savedTime) && savedTime > 0) {
      const elapsedSinceSave = wasPlaying && Number.isFinite(savedAt)
        ? Math.max(0, (Date.now() - savedAt) / 1000)
        : 0;
      const targetTime = savedTime + elapsedSinceSave;

      bgm.currentTime = bgm.duration
        ? targetTime % bgm.duration
        : targetTime;
    }

    restored = true;
  }

  function saveBgmTime() {
    if (!Number.isFinite(bgm.currentTime)) return;
    sessionStorage.setItem(savedTimeKey, String(bgm.currentTime));
    sessionStorage.setItem(savedAtKey, String(Date.now()));
    sessionStorage.setItem(playingKey, bgm.paused ? '0' : '1');
  }

  function playBgm() {
    restoreBgmTime();
    bgm.play().catch(function () {});
  }

  bgm.addEventListener('loadedmetadata', restoreBgmTime, { once: true });
  if (bgm.readyState >= 1) {
    restoreBgmTime();
  }

  bgm.addEventListener('timeupdate', saveBgmTime);
  setInterval(saveBgmTime, 250);
  window.addEventListener('pagehide', saveBgmTime);
  window.addEventListener('beforeunload', saveBgmTime);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      saveBgmTime();
    }
  });

  if (sessionStorage.getItem(playingKey) === '1') {
    playBgm();
  }

  document.addEventListener('pointerdown', playBgm, { once: true });
  document.addEventListener('click', playBgm, { once: true });
  document.addEventListener('touchstart', playBgm, { once: true });
  document.addEventListener('keydown', playBgm, { once: true });
});
