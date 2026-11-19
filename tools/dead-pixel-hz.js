window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["dead-pixel-hz"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    liveHz: isBn ? "লাইভ রিফ্রেশ রেট" : "Live Refresh Rate",
    frameTime: isBn ? "ফ্রেম টাইম" : "Frame Time",
    resolution: isBn ? "স্ক্রিন রেজোলিউশন" : "Screen Resolution",
    pixelRatio: isBn ? "পিক্সেল ডেনসিটি (DPR)" : "Pixel Ratio (DPR)",
    colorDepth: isBn ? "কালার ডেপথ" : "Color Depth",
    launchBtn: isBn ? "ফুলস্ক্রিন ডেড পিক্সেল টেস্ট চালু করুন" : "Launch Fullscreen Dead Pixel Test",
    pickColor: isBn ? "অথবা নির্দিষ্ট রঙে ক্লিক করে সরাসরি ফুলস্ক্রিনে দেখুন:" : "Or click any solid color to inspect fullscreen:",
    overlayHint: isBn
      ? "রং বদলাতে স্ক্রিনে ট্যাপ/ক্লিক করুন অথবা Space চাপুন • বের হতে ESC চাপুন"
      : "Tap/Click or press Space to switch colors • Press ESC or X to exit",
    exitBtn: isBn ? "বের হোন" : "Exit"
  };

  const colors = [
    { name: "Pure Red", hex: "#ff0000", text: "text-white" },
    { name: "Pure Green", hex: "#00ff00", text: "text-slate-950" },
    { name: "Pure Blue", hex: "#0000ff", text: "text-white" },
    { name: "Pure White", hex: "#ffffff", text: "text-slate-950" },
    { name: "Pure Black", hex: "#000000", text: "text-white" },
    { name: "Cyan", hex: "#00ffff", text: "text-slate-950" },
    { name: "Magenta", hex: "#ff00ff", text: "text-white" },
    { name: "Yellow", hex: "#ffff00", text: "text-slate-950" },
    { name: "Gradient Banding", hex: "linear-gradient(90deg,#000000,#ffffff)", text: "text-cyan-400" }
  ];

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Live Refresh Rate Telemetry Card -->
      <div class="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-[#0a142f] to-slate-900 border border-cyan-500/25 text-white">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div class="text-center sm:text-left">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> REAL-TIME FPS / HZ
            </span>
            <div class="flex items-baseline justify-center sm:justify-start gap-2">
              <span id="hz-main-val" class="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">--</span>
              <span class="text-xl font-extrabold text-cyan-300">Hz</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">${T.liveHz} • ${T.frameTime}: <strong id="hz-frame-ms" class="text-white">-- ms</strong></p>
          </div>

          <!-- Animated Motion Bar (Smoothness Check) -->
          <div class="w-full sm:w-64 space-y-2">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between">
              <span>Motion Smoothness</span>
              <span id="hz-tier-badge" class="text-emerald-400">Measuring...</span>
            </div>
            <div class="relative h-10 rounded-xl bg-slate-950 border border-white/10 overflow-hidden">
              <div id="hz-ufo-box" class="absolute top-1.5 left-0 w-10 h-7 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-cyan-400/40 flex items-center justify-center text-[10px] font-extrabold text-slate-950">HZ</div>
            </div>
          </div>
        </div>

        <!-- Screen Specs Strip -->
        <div class="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10 text-center">
          <div class="p-2.5 rounded-xl bg-white/5">
            <div class="text-[10px] text-slate-400 font-bold uppercase">${T.resolution}</div>
            <div id="dp-res" class="text-xs sm:text-sm font-extrabold text-white mt-0.5">--</div>
          </div>
          <div class="p-2.5 rounded-xl bg-white/5">
            <div class="text-[10px] text-slate-400 font-bold uppercase">${T.pixelRatio}</div>
            <div id="dp-dpr" class="text-xs sm:text-sm font-extrabold text-cyan-300 mt-0.5">--</div>
          </div>
          <div class="p-2.5 rounded-xl bg-white/5">
            <div class="text-[10px] text-slate-400 font-bold uppercase">${T.colorDepth}</div>
            <div id="dp-depth" class="text-xs sm:text-sm font-extrabold text-fuchsia-300 mt-0.5">--</div>
          </div>
        </div>
      </div>

      <!-- Dead Pixel Launcher & Swatches -->
      <div class="rounded-2xl p-5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4">
        <button id="dp-launch-btn" class="btn-gradient-emerald btn-shimmer w-full py-3.5 px-6 rounded-xl text-sm font-extrabold text-white shadow-lg flex items-center justify-center gap-2">
          <i data-lucide="maximize-2" class="w-4 h-4"></i>
          <span>${T.launchBtn}</span>
        </button>

        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">${T.pickColor}</p>
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            ${colors
              .map(
                (c, idx) => `
              <button data-color-idx="${idx}" class="dp-swatch group relative h-14 rounded-xl border border-slate-300 dark:border-white/20 overflow-hidden hover:scale-105 transition shadow-sm" style="background:${c.hex}">
                <span class="absolute bottom-1 inset-x-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-black/50 text-white truncate">${c.name}</span>
              </button>`
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Populate Screen Specs
  const physW = Math.round(window.screen.width * (window.devicePixelRatio || 1));
  const physH = Math.round(window.screen.height * (window.devicePixelRatio || 1));
  container.querySelector("#dp-res").textContent = `${window.screen.width}×${window.screen.height} (${physW}×${physH})`;
  container.querySelector("#dp-dpr").textContent = `${(window.devicePixelRatio || 1).toFixed(2)}x`;
  container.querySelector("#dp-depth").textContent = `${window.screen.colorDepth}-bit`;

  // Live Refresh Rate Measurement + Motion Bar
  let rafId = null;
  let lastTs = performance.now();
  const deltas = [];
  let boxPos = 0;
  let boxDir = 1;

  const hzValEl = container.querySelector("#hz-main-val");
  const msValEl = container.querySelector("#hz-frame-ms");
  const tierEl = container.querySelector("#hz-tier-badge");
  const ufoBox = container.querySelector("#hz-ufo-box");

  function tick(now) {
    if (!container.isConnected) return;
    const dt = now - lastTs;
    lastTs = now;

    if (dt > 1 && dt < 200) {
      deltas.push(dt);
      if (deltas.length > 45) deltas.shift();
      if (deltas.length >= 10) {
        const avgMs = deltas.reduce((a, b) => a + b, 0) / deltas.length;
        const hz = Math.round(1000 / avgMs);
        hzValEl.textContent = hz;
        msValEl.textContent = `${avgMs.toFixed(1)} ms`;
        tierEl.textContent = hz >= 115 ? "ProMotion / High Hz" : hz >= 85 ? "Smooth 90Hz+" : "Standard 60Hz";
      }
    }

    // Move smoothness indicator
    const parentW = (ufoBox.parentElement?.clientWidth || 240) - 44;
    boxPos += boxDir * (dt * 0.22);
    if (boxPos >= parentW) { boxPos = parentW; boxDir = -1; }
    if (boxPos <= 0) { boxPos = 0; boxDir = 1; }
    ufoBox.style.transform = `translateX(${boxPos}px)`;

    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  // Fullscreen Dead Pixel Overlay
  let overlay = null;
  let currentIdx = 0;

  function renderOverlayColor() {
    if (!overlay) return;
    const c = colors[currentIdx];
    overlay.style.background = c.hex;
    const label = overlay.querySelector("#dp-ov-label");
    if (label) label.textContent = `${c.name} (${currentIdx + 1}/${colors.length})`;
  }

  function closeOverlay() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    document.removeEventListener("keydown", onOverlayKey);
  }

  function onOverlayKey(e) {
    if (e.key === "Escape") {
      closeOverlay();
    } else if (e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      currentIdx = (currentIdx + 1) % colors.length;
      renderOverlayColor();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      currentIdx = (currentIdx - 1 + colors.length) % colors.length;
      renderOverlayColor();
    }
  }

  function openOverlay(startIdx = 0) {
    closeOverlay();
    currentIdx = startIdx;
    overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[9999] cursor-pointer select-none flex flex-col items-center justify-between p-6";
    overlay.innerHTML = `
      <div class="w-full flex items-center justify-between pointer-events-none">
        <span id="dp-ov-label" class="px-3 py-1.5 rounded-full text-xs font-extrabold bg-black/55 text-white backdrop-blur-md"></span>
        <button id="dp-ov-exit" class="pointer-events-auto px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-black/65 hover:bg-rose-600 text-white backdrop-blur-md transition">✕ ${T.exitBtn}</button>
      </div>
      <div id="dp-ov-hint" class="px-4 py-2 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md text-center transition-opacity duration-500">
        ${T.overlayHint}
      </div>
    `;

    document.body.appendChild(overlay);
    renderOverlayColor();

    if (overlay.requestFullscreen) {
      overlay.requestFullscreen().catch(() => {});
    }

    // Fade hint out after 3.5s so user gets an unobstructed view
    setTimeout(() => {
      const hint = overlay?.querySelector("#dp-ov-hint");
      if (hint) hint.style.opacity = "0.18";
    }, 3500);

    overlay.querySelector("#dp-ov-exit").addEventListener("click", (e) => {
      e.stopPropagation();
      closeOverlay();
    });

    overlay.addEventListener("click", () => {
      currentIdx = (currentIdx + 1) % colors.length;
      renderOverlayColor();
    });

    document.addEventListener("keydown", onOverlayKey);
  }

  container.querySelector("#dp-launch-btn").addEventListener("click", () => openOverlay(0));
  container.querySelectorAll(".dp-swatch").forEach((btn) => {
    btn.addEventListener("click", () => openOverlay(Number(btn.getAttribute("data-color-idx"))));
  });

  // Auto-Cleanup
  window.addEventListener("hashchange", function cleanup() {
    cancelAnimationFrame(rafId);
    closeOverlay();
    window.removeEventListener("hashchange", cleanup);
  });
};