window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["touchscreen-test"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    coverage: isBn ? "টাচ কভারেজ" : "Touch Coverage",
    activeTouches: isBn ? "বর্তমান টাচ" : "Active Fingers",
    maxTouches: isBn ? "সর্বোচ্চ মাল্টি-টাচ" : "Max Multi-Touch",
    fullscreenBtn: isBn ? "ফুলস্ক্রিন ফোন টেস্ট" : "Fullscreen Edge Test",
    resetBtn: isBn ? "রিসেট গ্রিড" : "Reset Grid",
    instruction: isBn
      ? "সবগুলো ঘরে আঙুল বা মাউস বোলান — কোনো ঘর সবুজ না হলে সেখানে ডেড টাচ জোন আছে।"
      : "Swipe your finger or pointer across every square. Unlit squares reveal dead touch zones.",
    allPassed: isBn ? "অসাধারণ! ১০০% টাচ জোন সঠিকভাবে কাজ করছে।" : "Perfect! 100% of touch zones responded cleanly.",
    exitFull: isBn ? "বের হোন" : "Exit"
  };

  const COLS = 8;
  const ROWS = 10;
  const TOTAL = COLS * ROWS;

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Live Telemetry Row -->
      <div class="grid grid-cols-3 gap-3">
        <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center">
          <div class="text-[10px] font-bold uppercase text-slate-400">${T.coverage}</div>
          <div id="ts-cov-val" class="text-lg sm:text-xl font-extrabold text-emerald-400 mt-0.5">0%</div>
        </div>
        <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center">
          <div class="text-[10px] font-bold uppercase text-slate-400">${T.activeTouches}</div>
          <div id="ts-active-val" class="text-lg sm:text-xl font-extrabold text-cyan-400 mt-0.5">0</div>
        </div>
        <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center">
          <div class="text-[10px] font-bold uppercase text-slate-400">${T.maxTouches}</div>
          <div id="ts-max-val" class="text-lg sm:text-xl font-extrabold text-fuchsia-400 mt-0.5">0</div>
        </div>
      </div>

      <!-- Progress Bar & Buttons -->
      <div class="space-y-3">
        <div class="h-2.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div id="ts-progress-bar" class="h-full w-0 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 transition-all duration-150"></div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2.5">
          <p id="ts-hint" class="text-xs font-medium text-slate-500 dark:text-slate-400">${T.instruction}</p>
          <div class="flex items-center gap-2">
            <button id="ts-full-btn" class="btn-gradient-cyber btn-shimmer px-4 py-2 rounded-xl text-xs font-extrabold text-white inline-flex items-center gap-1.5">
              <i data-lucide="maximize" class="w-3.5 h-3.5"></i> ${T.fullscreenBtn}
            </button>
            <button id="ts-reset-btn" class="btn-glass px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> ${T.resetBtn}
            </button>
          </div>
        </div>
      </div>

      <!-- Interactive Touch Grid -->
      <div id="ts-grid-wrap" class="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 p-1.5 select-none" style="touch-action: none;">
        <div id="ts-grid" class="grid gap-1" style="grid-template-columns: repeat(${COLS}, minmax(0, 1fr));"></div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const gridEl = container.querySelector("#ts-grid");
  const covVal = container.querySelector("#ts-cov-val");
  const activeVal = container.querySelector("#ts-active-val");
  const maxVal = container.querySelector("#ts-max-val");
  const progressBar = container.querySelector("#ts-progress-bar");
  const hintEl = container.querySelector("#ts-hint");

  let touchedSet = new Set();
  let isMouseDown = false;
  let maxTouches = 0;

  function buildGrid(targetGrid, cols, rows, cellHeightClass) {
    targetGrid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    targetGrid.innerHTML = "";
    const total = cols * rows;
    for (let i = 0; i < total; i++) {
      const cell = document.createElement("div");
      cell.dataset.cellIdx = i;
      cell.className = `${cellHeightClass} rounded-md bg-slate-900 border border-white/10 transition-colors duration-150`;
      targetGrid.appendChild(cell);
    }
  }

  function lightCell(cell, setRef, totalCount, onProgress) {
    if (!cell || !cell.dataset.cellIdx) return;
    const idx = cell.dataset.cellIdx;
    if (!setRef.has(idx)) {
      setRef.add(idx);
      cell.classList.remove("bg-slate-900", "border-white/10");
      cell.classList.add("bg-emerald-500", "border-emerald-300", "shadow-sm");
      onProgress(Math.round((setRef.size / totalCount) * 100));
    }
  }

  function updateMainProgress(pct) {
    covVal.textContent = `${pct}%`;
    progressBar.style.width = `${pct}%`;
    if (pct === 100) {
      hintEl.textContent = T.allPassed;
      hintEl.className = "text-xs font-extrabold text-emerald-500";
      api.markResult("pass");
    }
  }

  function resetMainGrid() {
    touchedSet = new Set();
    maxTouches = 0;
    covVal.textContent = "0%";
    activeVal.textContent = "0";
    maxVal.textContent = "0";
    progressBar.style.width = "0%";
    hintEl.textContent = T.instruction;
    hintEl.className = "text-xs font-medium text-slate-500 dark:text-slate-400";
    buildGrid(gridEl, COLS, ROWS, "h-8 sm:h-9");
  }
  resetMainGrid();

  function handlePoint(clientX, clientY, setRef, totalCount, onProgress) {
    const elem = document.elementFromPoint(clientX, clientY);
    if (elem && elem.dataset && elem.dataset.cellIdx !== undefined) {
      lightCell(elem, setRef, totalCount, onProgress);
    }
  }

  // Pointer & Multi-Touch Handlers on Inline Grid
  gridEl.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    activeVal.textContent = "1";
    if (1 > maxTouches) { maxTouches = 1; maxVal.textContent = "1"; }
    handlePoint(e.clientX, e.clientY, touchedSet, TOTAL, updateMainProgress);
  });

  gridEl.addEventListener("mousemove", (e) => {
    if (!isMouseDown) return;
    handlePoint(e.clientX, e.clientY, touchedSet, TOTAL, updateMainProgress);
  });

  function onMouseUp() {
    isMouseDown = false;
    if (container.isConnected) activeVal.textContent = "0";
  }
  window.addEventListener("mouseup", onMouseUp);

  gridEl.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const count = e.touches.length;
    activeVal.textContent = count;
    if (count > maxTouches) { maxTouches = count; maxVal.textContent = count; }
    for (let i = 0; i < count; i++) {
      handlePoint(e.touches[i].clientX, e.touches[i].clientY, touchedSet, TOTAL, updateMainProgress);
    }
  }, { passive: false });

  gridEl.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const count = e.touches.length;
    activeVal.textContent = count;
    if (count > maxTouches) { maxTouches = count; maxVal.textContent = count; }
    for (let i = 0; i < count; i++) {
      handlePoint(e.touches[i].clientX, e.touches[i].clientY, touchedSet, TOTAL, updateMainProgress);
    }
  }, { passive: false });

  gridEl.addEventListener("touchend", (e) => {
    activeVal.textContent = e.touches.length;
  });

  container.querySelector("#ts-reset-btn").addEventListener("click", resetMainGrid);

  // Fullscreen Edge-to-Edge Mobile Touch Test
  let fullOverlay = null;
  function closeFullscreenTouch() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (fullOverlay) {
      fullOverlay.remove();
      fullOverlay = null;
    }
  }

  container.querySelector("#ts-full-btn").addEventListener("click", () => {
    closeFullscreenTouch();
    const fCols = window.innerWidth < 640 ? 6 : 12;
    const fRows = window.innerWidth < 640 ? 12 : 8;
    const fTotal = fCols * fRows;
    const fSet = new Set();

    fullOverlay = document.createElement("div");
    fullOverlay.className = "fixed inset-0 z-[9999] bg-slate-950 p-1.5 flex flex-col select-none";
    fullOverlay.style.touchAction = "none";
    fullOverlay.innerHTML = `
      <div class="flex items-center justify-between px-3 py-2 bg-slate-900/90 rounded-xl mb-1.5 text-white text-xs font-extrabold">
        <span>Edge Test: <strong id="fs-ts-pct" class="text-emerald-400">0%</strong> • Fingers: <strong id="fs-ts-fing" class="text-cyan-400">0</strong></span>
        <button id="fs-ts-exit" class="px-3 py-1 rounded-lg bg-rose-600 text-white">✕ ${T.exitFull}</button>
      </div>
      <div id="fs-ts-grid" class="flex-1 grid gap-1"></div>
    `;
    document.body.appendChild(fullOverlay);
    if (fullOverlay.requestFullscreen) fullOverlay.requestFullscreen().catch(() => {});

    const fsGrid = fullOverlay.querySelector("#fs-ts-grid");
    const fsPct = fullOverlay.querySelector("#fs-ts-pct");
    const fsFing = fullOverlay.querySelector("#fs-ts-fing");
    buildGrid(fsGrid, fCols, fRows, "h-full w-full");

    const updateFs = (pct) => { fsPct.textContent = `${pct}%`; };
    let fsDown = false;

    fsGrid.addEventListener("mousedown", (e) => { fsDown = true; handlePoint(e.clientX, e.clientY, fSet, fTotal, updateFs); });
    fsGrid.addEventListener("mousemove", (e) => { if (fsDown) handlePoint(e.clientX, e.clientY, fSet, fTotal, updateFs); });
    fsGrid.addEventListener("mouseup", () => { fsDown = false; });

    const onFsTouch = (e) => {
      e.preventDefault();
      fsFing.textContent = e.touches.length;
      if (e.touches.length > maxTouches) { maxTouches = e.touches.length; maxVal.textContent = maxTouches; }
      for (let i = 0; i < e.touches.length; i++) {
        handlePoint(e.touches[i].clientX, e.touches[i].clientY, fSet, fTotal, updateFs);
      }
    };
    fsGrid.addEventListener("touchstart", onFsTouch, { passive: false });
    fsGrid.addEventListener("touchmove", onFsTouch, { passive: false });
    fsGrid.addEventListener("touchend", (e) => { fsFing.textContent = e.touches.length; });

    fullOverlay.querySelector("#fs-ts-exit").addEventListener("click", closeFullscreenTouch);
  });

  // Auto-Cleanup
  window.addEventListener("hashchange", function cleanup() {
    window.removeEventListener("mouseup", onMouseUp);
    closeFullscreenTouch();
    window.removeEventListener("hashchange", cleanup);
  });
};