import { session } from "electron";

// Ad service domains
const BLOCKED_DOMAINS = [
  "*://*.doubleclick.net/*",
  "*://*.googlesyndication.com/*",
  "*://*.googleadservices.com/*",
  "*://pagead2.googlesyndication.com/*",
  "*://tpc.googlesyndication.com/*",
  "*://adservice.google.com/*",
  "*://adservice.google.co.uk/*",
];

// YouTube-specific ad endpoints
const BLOCKED_YOUTUBE = [
  "*://*.youtube.com/api/stats/ads*",
  "*://*.youtube.com/pagead/*",
  "*://*.youtube.com/ptracking*",
  "*://*.youtube.com/youtubei/v1/log_event?*yt_ad*",
  // Audio/video ad streams from Google's CDN (yt_ad=1 marks ad media)
  "*://*.googlevideo.com/videoplayback?*&yt_ad=1*",
  "*://*.googlevideo.com/videoplayback?yt_ad=1*",
];

export const setupAdBlocker = () => {
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: [...BLOCKED_DOMAINS, ...BLOCKED_YOUTUBE] },
    (_, callback) => callback({ cancel: true })
  );
};
