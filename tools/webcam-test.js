window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["webcam-test"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    start: isBn ? "ক্যামেরা চালু করুন" : "Start Camera",
    stop: isBn ? "ক্যামেরা বন্ধ করুন" : "Stop Camera",
    snap: isBn ? "ছবি তুলুন (Snapshot)" : "Take Snapshot",
    mirror: isBn ? "মিরর ফ্লিপ" : "Mirror",
    grid: isBn ? "গ্রিড লাইন" : "Grid",
    selectCam: isBn ? "ক্যামেরা সিলেক্ট করুন" : "Select Camera",
    idleMsg: isBn
      ? "ক্যামেরা চালু করতে বাটনে ক্লিক করুন — কোনো ভিডিও সার্ভারে আপলোড হয় না।"
      : "Click Start Camera to test clarity & FPS — 100% local, zero upload.",
    errCam: isBn
      ? "ক্যামেরা পারমিশন পাওয়া যায়নি বা ডিভাইসে ক্যামেরা নেই (HTTPS প্রয়োজন)।"
      : "Camera permission denied or no camera detected (requires HTTPS / localhost).",
    snapsTitle: isBn ? "ক্যাপচার করা ছবি (ক্লিক করে ডাউনলোড করুন)" : "Captured Snapshots (Click to Download)"
  };

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex flex-wrap items-center gap-2">
          <button id="cam-toggle-btn" class="btn-gradient-emerald btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-lg">
            <i data-lucide="camera" class="w-4 h-4"></i>
            <span>${T.start}</span>
          </button>
          <button id="cam-snap-btn" disabled class="btn-gradient-cyber btn-shimmer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white opacity-40 cursor-not-allowed">
            <i data-lucide="aperture" class="w-4 h-4"></i>
            <span>${T.snap}</span>
          </button>
          <button id="cam-mirror-btn" class="btn-glass px-3 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
            <i data-lucide="flip-horizontal" class="w-3.5 h-3.5 text-cyan-400"></i> ${T.mirror}
          </button>
          <button id="cam-grid-btn" class="btn-glass px-3 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
            <i data-lucide="grid-3x3" class="w-3.5 h-3.5 text-fuchsia-400"></i> ${T.grid}
          </button>
        </div>

        <select id="cam-device-select" class="hidden px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 focus:outline-none max-w-[220px]">
          <option value="">${T.selectCam}</option>
        </select>
      </div>

      <!-- Video Viewport -->
      <div class="relative rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/25 aspect-video flex items-center justify-center">
        <video id="cam-video" autoplay playsinline muted class="w-full h-full object-cover hidden transition-transform duration-200"></video>

        <!-- Rule of Thirds Grid Overlay -->
        <div id="cam-grid-overlay" class="hidden pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
          <div class="border-r border-b border-white/25"></div>
          <div class="border-r border-b border-white/25"></div>
          <div class="border-b border-white/25"></div>
          <div class="border-r border-b border-white/25"></div>
          <div class="border-r border-b border-white/25"></div>
          <div class="border-b border-white/25"></div>
          <div class="border-r border-white/25"></div>
          <div class="border-r border-white/25"></div>
          <div></div>
        </div>

        <!-- Idle / Error Placeholder -->
        <div id="cam-placeholder" class="text-center px-6 py-10">
          <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <i data-lucide="video" class="w-7 h-7"></i>
          </div>
          <p id="cam-placeholder-text" class="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">${T.idleMsg}</p>
        </div>

        <!-- Live Overlay Badges -->
        <div id="cam-live-badge" class="hidden absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-600 text-white flex items-center gap-1.5 shadow">
          <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span> LIVE
        </div>
      </div>

      <!-- Live Hardware Telemetry Strip -->
      <div class="grid grid-cols-3 gap-3">
        <div class="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center">
          <div class="text-[10px] font-bold uppercase text-slate-400">Resolution</div>
          <div id="cam-res-val" class="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5">—</div>
        </div>
        <div class="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center">
          <div class="text-[10px] font-bold uppercase text-slate-400">Frame Rate</div>
          <div id="cam-fps-val" class="text-sm sm:text-base font-extrabold text-cyan-400 mt-0.5">—</div>
        </div>
        <div class="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center">
          <div class="text-[10px] font-bold uppercase text-slate-400">Aspect Ratio</div>
          <div id="cam-ratio-val" class="text-sm sm:text-base font-extrabold text-fuchsia-400 mt-0.5">—</div>
        </div>
      </div>

      <!-- Local Snapshot Gallery -->
      <div id="cam-snaps-wrap" class="hidden space-y-2.5">
        <h4 class="text-xs font-extrabold text-slate-500 dark:text-slate-300">${T.snapsTitle}</h4>
        <div id="cam-snaps-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-3"></div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  let stream = null;
  let isMirrored = true;
  let fpsFrames = 0;
  let fpsLastTime = performance.now();
  let fpsRaf = null;

  const toggleBtn = container.querySelector("#cam-toggle-btn");
  const snapBtn = container.querySelector("#cam-snap-btn");
  const mirrorBtn = container.querySelector("#cam-mirror-btn");
  const gridBtn = container.querySelector("#cam-grid-btn");
  const deviceSelect = container.querySelector("#cam-device-select");
  const video = container.querySelector("#cam-video");
  const gridOverlay = container.querySelector("#cam-grid-overlay");
  const placeholder = container.querySelector("#cam-placeholder");
  const placeholderText = container.querySelector("#cam-placeholder-text");
  const liveBadge = container.querySelector("#cam-live-badge");
  const resVal = container.querySelector("#cam-res-val");
  const fpsVal = container.querySelector("#cam-fps-val");
  const ratioVal = container.querySelector("#cam-ratio-val");
  const snapsWrap = container.querySelector("#cam-snaps-wrap");
  const snapsGrid = container.querySelector("#cam-snaps-grid");

  function updateMirrorStyle() {
    video.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)";
  }
  updateMirrorStyle();

  function calcAspect(w, h) {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(w, h) || 1;
    return `${w / g}:${h / g}`;
  }

  async function populateCams() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      if (cams.length > 0) {
        deviceSelect.classList.remove("hidden");
        const curr = deviceSelect.value;
        deviceSelect.innerHTML = cams
          .map((c, idx) => `<option value="${c.deviceId}">${c.label || "Camera " + (idx + 1)}</option>`)
          .join("");
        if (curr) deviceSelect.value = curr;
      }
    } catch (e) {}
  }

  function measureFps() {
    if (!stream || !container.isConnected) return;
    fpsFrames++;
    const now = performance.now();
    if (now - fpsLastTime >= 1000) {
      fpsVal.textContent = `${fpsFrames} FPS`;
      fpsFrames = 0;
      fpsLastTime = now;
    }
    fpsRaf = requestAnimationFrame(measureFps);
  }

  function stopCamera() {
    cancelAnimationFrame(fpsRaf);
    if (stream) {
      stream.getTracks().forEach((tr) => tr.stop());
      stream = null;
    }
    video.srcObject = null;
    video.classList.add("hidden");
    liveBadge.classList.add("hidden");
    placeholder.classList.remove("hidden");
    placeholderText.textContent = T.idleMsg;
    toggleBtn.classList.remove("btn-gradient-rose");
    toggleBtn.classList.add("btn-gradient-emerald");
    toggleBtn.querySelector("span").textContent = T.start;
    snapBtn.disabled = true;
    snapBtn.classList.add("opacity-40", "cursor-not-allowed");
    resVal.textContent = "—";
    fpsVal.textContent = "—";
    ratioVal.textContent = "—";
  }

  async function startCamera(deviceId = "") {
    stopCamera();
    try {
      const videoConstraints = deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : { width: { ideal: 1920 }, height: { ideal: 1080 } };

      stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
      await populateCams();

      video.srcObject = stream;
      video.classList.remove("hidden");
      placeholder.classList.add("hidden");
      liveBadge.classList.remove("hidden");

      toggleBtn.classList.remove("btn-gradient-emerald");
      toggleBtn.classList.add("btn-gradient-rose");
      toggleBtn.querySelector("span").textContent = T.stop;
      snapBtn.disabled = false;
      snapBtn.classList.remove("opacity-40", "cursor-not-allowed");

      video.onloadedmetadata = () => {
        const w = video.videoWidth;
        const h = video.videoHeight;
        resVal.textContent = `${w}×${h}`;
        ratioVal.textContent = calcAspect(w, h);
        const trackSettings = stream.getVideoTracks()[0]?.getSettings();
        if (trackSettings && trackSettings.frameRate) {
          fpsVal.textContent = `${Math.round(trackSettings.frameRate)} FPS`;
        }
        fpsFrames = 0;
        fpsLastTime = performance.now();
        measureFps();
      };
    } catch (err) {
      placeholder.classList.remove("hidden");
      placeholderText.textContent = T.errCam;
      placeholderText.classList.add("text-rose-400");
    }
  }

  toggleBtn.addEventListener("click", () => {
    if (stream) stopCamera();
    else startCamera(deviceSelect.value);
  });

  deviceSelect.addEventListener("change", () => {
    if (stream) startCamera(deviceSelect.value);
  });

  mirrorBtn.addEventListener("click", () => {
    isMirrored = !isMirrored;
    updateMirrorStyle();
  });

  gridBtn.addEventListener("click", () => {
    gridOverlay.classList.toggle("hidden");
  });

  snapBtn.addEventListener("click", () => {
    if (!stream || !video.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    const cctx = c.getContext("2d");
    if (isMirrored) {
      cctx.translate(c.width, 0);
      cctx.scale(-1, 1);
    }
    cctx.drawImage(video, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/png");

    snapsWrap.classList.remove("hidden");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `checkkit-webcam-${Date.now()}.png`;
    link.className = "group relative block rounded-xl overflow-hidden border border-cyan-500/30 hover:scale-105 transition";
    link.innerHTML = `
      <img src="${dataUrl}" class="w-full h-24 object-cover" alt="Webcam snapshot" />
      <span class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] font-extrabold text-white transition">Download PNG</span>
    `;
    snapsGrid.prepend(link);
  });

  // Auto-Cleanup when navigating away
  window.addEventListener("hashchange", function cleanup() {
    stopCamera();
    window.removeEventListener("hashchange", cleanup);
  });
};