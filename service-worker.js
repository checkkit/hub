const CACHE_NAME = "checkkit-cache-v1";

// অফলাইনে চলার জন্য প্রি-ক্যাশ ফাইল তালিকা
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./config.js",
  "./app.js",
  "./manifest.json",
  "./assets/logo.png",
  "./tools/speaker-water-eject.js",
  "./tools/mic-test.js",
  "./tools/webcam-test.js",
  "./tools/dead-pixel-hz.js",
  "./tools/touchscreen-test.js",
  "./tools/keyboard-mouse-test.js",
  "./tools/gamepad-test.js",
  "./tools/ip-webrtc-leak.js",
  "./tools/browser-fingerprint.js",
  "./tools/exif-remover.js",
  "./tools/ping-jitter-test.js",
  "./tools/temp-mail.js",
  "./tools/scam-link-checker.js",
  "./tools/password-gmail-alias.js",
  "./tools/scorecard-export.js"
];

// যেসব ডোমেইন কখনো ক্যাশ হবে না (রিয়েল-টাইম নেটওয়ার্ক, API ও অথেনটিকেশন)
const BYPASS_HOSTS = [
  "ipwho.is",
  "ipapi.co",
  "api.mail.tm",
  "rdap.org",
  "workers.dev",
  "script.google.com",
  "script.googleusercontent.com",
  "1.1.1.1",
  "www.google.com",
  "github.githubassets.com",
  // Ad Networks (কখনো ক্যাশ হবে না, সবসময় ফ্রেশ অ্যাড লোড হবে)
  "googlesyndication.com",
  "doubleclick.net",
  "googleadservices.com",
  "adtrafficquality.google"
];

// 1. Install: নিরাপদে প্রতিটি ফাইল ক্যাশ করা (কোনো একটি ফাইল মিসিং হলেও ইনস্টল ফেল করবে না)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        CORE_ASSETS.map((url) =>
          fetch(url, { cache: "no-cache" })
            .then((res) => {
              if (res && res.ok) return cache.put(url, res);
            })
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

// 2. Activate: পুরোনো ভার্সনের ক্যাশ অটোমেটিক পরিষ্কার করা
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 3. Fetch: Stale-While-Revalidate (দ্রুত লোডিং + ব্যাকগ্রাউন্ডে নতুন আপডেট)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // বাইরের কোনো ডোমেইন (Adsterra/Monetag/API) কখনো Service Worker ক্যাশ করবে না
if (url.origin !== self.location.origin) return;

  // Ping টেস্ট বা এক্সটার্নাল লাইভ API হলে সরাসরি নেটওয়ার্ক থেকে আনবে
  if (
    url.searchParams.has("ck_ping") ||
    BYPASS_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith("." + host))
  ) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && (res.status === 200 || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached || caches.match("./index.html"));

      return cached || networkFetch;
    })
  );
});