// Injected into YouTube Music pages to skip audio ads.
// Watches for the 'has-advertisement' attribute on the player bar and
// fast-forwards the media element to its end, triggering normal track advance.
export const YOUTUBE_MUSIC_AD_BLOCKER = `
(function() {
  if (window.__adBlockerActive) return;
  window.__adBlockerActive = true;

  let skipInterval = null;

  function trySkip() {
    const media = document.querySelector('video, audio');
    if (media && isFinite(media.duration) && media.duration > 0) {
      media.currentTime = media.duration;
      clearInterval(skipInterval);
      skipInterval = null;
    }
  }

  function onMutation() {
    const playerBar = document.querySelector('ytmusic-player-bar');
    const isAd = playerBar && playerBar.hasAttribute('has-advertisement');
    if (isAd && !skipInterval) {
      trySkip();
      skipInterval = setInterval(trySkip, 200);
    } else if (!isAd && skipInterval) {
      clearInterval(skipInterval);
      skipInterval = null;
    }
  }

  new MutationObserver(onMutation).observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ['has-advertisement'],
  });

  onMutation();
})();
`;
