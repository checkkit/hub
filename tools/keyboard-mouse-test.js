window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["keyboard-mouse-test"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    tabMouse: isBn ? "মাউস ডাবল-ক্লিক ও পোলিং রেট" : "Mouse Double-Click & Polling Rate",
    tabKey: isBn ? "কিবোর্ড বাটন টেস্টার" : "Visual Keyboard Tester",
    clickPadTitle: isBn ? "ডাবল-ক্লিক টেস্ট প্যাড (এখানে বারবার ক্লিক করুন)" : "Click Rapidly Here (Left / Middle / Right)",
    totalClicks: isBn ? "মোট ক্লিক" : "Total Clicks",
    faults: isBn ? "ডাবল-ক্লিক ত্রুটি" : "Double-Click Faults",
    lastInterval: isBn ? "সর্বশেষ গ্যাপ" : "Last Interval",
    pollingTitle: isBn ? "লাইভ মাউস পোলিং রেট (বক্সের ভেতর মাউস দ্রুত ঘোরান)" : "Live Mouse Polling Rate (Swirl Mouse Inside Box)",
    liveHz: isBn ? "বর্তমান Hz" : "Live Hz",
    peakHz: isBn ? "সর্বোচ্চ Hz" : "Peak Hz",
    reset: isBn ? "রিসেট" : "Reset",
    keyHint: isBn ? "ল্যাপটপ বা পিসির যেকোনো বাটন চাপুন — সক্রিয় বাটন সবুজ হয়ে থাকবে।" : "Press any key on your keyboard — working keys stay highlighted green.",
    lastKey: isBn ? "সর্বশেষ বাটন" : "Last Key Pressed",
    testedKeys: isBn ? "পরীক্ষিত বাটন" : "Unique Keys Tested"
  };

  const keyboardRows = [
    ["Escape", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"],
    ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
    ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash"],
    ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter"],
    ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight"],
    ["ControlLeft", "MetaLeft", "AltLeft", "Space", "AltRight", "ControlRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ArrowRight"]
  ];

  const keyLabels = {
    Escape: "ESC", Backquote: "`", Minus: "-", Equal: "=", Backspace: "⌫",
    Tab: "TAB", BracketLeft: "[", BracketRight: "]", Backslash: "\\",
    CapsLock: "CAPS", Semicolon: ";", Quote: "'", Enter: "ENTER",
    ShiftLeft: "SHIFT", ShiftRight: "SHIFT", Comma: ",", Period: ".", Slash: "/",
    ControlLeft: "CTRL", ControlRight: "CTRL", MetaLeft: "WIN/⌘", AltLeft: "ALT", AltRight: "ALT",
    Space: "SPACEBAR", ArrowLeft: "←", ArrowUp: "↑", ArrowDown: "↓", ArrowRight: "→"
  };

  function labelFor(code) {
    if (keyLabels[code]) return keyLabels[code];
    if (code.startsWith("Key")) return code.slice(3);
    if (code.startsWith("Digit")) return code.slice(5);
    return code;
  }

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Mode Switcher Tabs -->
      <div class="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <button id="km-tab-mouse" class="km-tab btn-gradient-cyber text-white py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2">
          <i data-lucide="mouse" class="w-4 h-4"></i> <span>${T.tabMouse}</span>
        </button>
        <button id="km-tab-key" class="km-tab text-slate-600 dark:text-slate-300 py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2">
          <i data-lucide="keyboard" class="w-4 h-4"></i> <span>${T.tabKey}</span>
        </button>
      </div>

      <!-- PANEL 1: MOUSE DOUBLE-CLICK & POLLING RATE -->
      <div id="km-panel-mouse" class="space-y-5">
        <!-- Double-Click Stats -->
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <div class="text-[10px] font-bold uppercase text-slate-400">${T.totalClicks}</div>
            <div id="mc-total" class="text-xl font-extrabold text-cyan-400">0</div>
          </div>
          <div class="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <div class="text-[10px] font-bold uppercase text-slate-400">${T.faults}</div>
            <div id="mc-faults" class="text-xl font-extrabold text-rose-500">0</div>
          </div>
          <div class="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <div class="text-[10px] font-bold uppercase text-slate-400">${T.lastInterval}</div>
            <div id="mc-gap" class="text-xl font-extrabold text-emerald-400">—</div>
          </div>
        </div>

        <!-- Click Pad -->
        <div id="mc-pad" class="select-none cursor-pointer rounded-2xl p-8 bg-gradient-to-br from-slate-900 via-[#0d1633] to-slate-900 border-2 border-cyan-500/40 hover:border-emerald-400 text-center text-white transition active:scale-[0.99]">
          <i data-lucide="mouse-pointer-click" class="w-9 h-9 text-cyan-400 mx-auto mb-2"></i>
          <h4 class="text-sm sm:text-base font-extrabold">${T.clickPadTitle}</h4>
          <p id="mc-status-line" class="text-xs text-slate-400 mt-1">Flags accidental switch double-clicks under 80ms</p>
        </div>

        <!-- Polling Rate Area -->
        <div class="rounded-2xl p-5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h4 class="text-xs sm:text-sm font-extrabold">${T.pollingTitle}</h4>
            <div class="flex items-center gap-3 text-xs font-extrabold">
              <span class="text-slate-400">${T.liveHz}: <strong id="mp-live-hz" class="text-emerald-400 text-sm">0 Hz</strong></span>
              <span class="text-slate-400">${T.peakHz}: <strong id="mp-peak-hz" class="text-fuchsia-400 text-sm">0 Hz</strong></span>
              <button id="mc-reset-btn" class="btn-glass px-3 py-1 rounded-lg text-[11px] font-bold">${T.reset}</button>
            </div>
          </div>
          <div id="mp-zone" class="h-28 rounded-xl bg-slate-950 border border-indigo-500/30 relative overflow-hidden flex items-end p-2 gap-1 cursor-crosshair">
            <span class="pointer-events-none absolute top-2 left-3 text-[10px] font-bold text-slate-500">Move mouse rapidly in circles here...</span>
          </div>
        </div>
      </div>

      <!-- PANEL 2: VISUAL KEYBOARD TESTER -->
      <div id="km-panel-key" class="hidden space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
          <div class="flex items-center gap-4 text-xs font-bold">
            <div><span class="text-slate-400">${T.lastKey}:</span> <strong id="kb-last-key" class="text-cyan-400 ml-1">—</strong></div>
            <div><span class="text-slate-400">${T.testedKeys}:</span> <strong id="kb-count" class="text-emerald-400 ml-1">0</strong></div>
          </div>
          <button id="kb-reset-btn" class="btn-glass px-3 py-1.5 rounded-xl text-xs font-bold">${T.reset}</button>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400">${T.keyHint}</p>

        <!-- Responsive Scrollable Keyboard Board -->
        <div class="overflow-x-auto pb-2">
          <div id="kb-board" class="min-w-[660px] p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-1.5 select-none">
            ${keyboardRows
              .map(
                (row) => `
              <div class="flex gap-1.5">
                ${row
                  .map((code) => {
                    const flexGrow = code === "Space" ? "flex-[5]" : ["Backspace", "Enter", "ShiftLeft", "ShiftRight"].includes(code) ? "flex-[1.8]" : "flex-1";
                    return `<div data-key-code="${code}" class="kb-key ${flexGrow} h-10 rounded-lg bg-slate-800/90 border border-white/10 text-slate-200 text-[10px] font-extrabold flex items-center justify-center transition-all duration-100">${labelFor(code)}</div>`;
                  })
                  .join("")}
              </div>`
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Tab Switching
  let activeTab = "mouse";
  const tabMouse = container.querySelector("#km-tab-mouse");
  const tabKey = container.querySelector("#km-tab-key");
  const panelMouse = container.querySelector("#km-panel-mouse");
  const panelKey = container.querySelector("#km-panel-key");

  function switchTab(tab) {
    activeTab = tab;
    const isMouse = tab === "mouse";
    panelMouse.classList.toggle("hidden", !isMouse);
    panelKey.classList.toggle("hidden", isMouse);
    tabMouse.className = isMouse
      ? "km-tab btn-gradient-cyber text-white py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2"
      : "km-tab text-slate-600 dark:text-slate-300 py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2";
    tabKey.className = !isMouse
      ? "km-tab btn-gradient-emerald text-white py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2"
      : "km-tab text-slate-600 dark:text-slate-300 py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2";
  }
  tabMouse.addEventListener("click", () => switchTab("mouse"));
  tabKey.addEventListener("click", () => switchTab("key"));

  // ---- MOUSE DOUBLE-CLICK DETECTOR ----
  let totalClicks = 0;
  let faults = 0;
  const lastDownTime = {};

  const mcPad = container.querySelector("#mc-pad");
  const mcTotal = container.querySelector("#mc-total");
  const mcFaults = container.querySelector("#mc-faults");
  const mcGap = container.querySelector("#mc-gap");
  const mcStatus = container.querySelector("#mc-status-line");

  mcPad.addEventListener("contextmenu", (e) => e.preventDefault());
  mcPad.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const now = performance.now();
    const btnId = e.button;
    const btnName = btnId === 0 ? "Left" : btnId === 2 ? "Right" : "Middle";
    totalClicks++;
    mcTotal.textContent = totalClicks;

    if (lastDownTime[btnId] !== undefined) {
      const diff = Math.round(now - lastDownTime[btnId]);
      mcGap.textContent = `${diff} ms`;
      if (diff < 80) {
        faults++;
        mcFaults.textContent = faults;
        mcPad.classList.remove("border-cyan-500/40");
        mcPad.classList.add("border-rose-500");
        mcStatus.textContent = `⚠ FAULT: ${btnName} button double-clicked in ${diff}ms!`;
        mcStatus.className = "text-xs font-extrabold text-rose-400 mt-1";
      } else {
        mcPad.classList.remove("border-rose-500");
        mcPad.classList.add("border-cyan-500/40");
        mcStatus.textContent = `✓ Clean ${btnName} Click (${diff}ms gap)`;
        mcStatus.className = "text-xs font-bold text-emerald-400 mt-1";
      }
    } else {
      mcStatus.textContent = `✓ Clean ${btnName} Click`;
    }
    lastDownTime[btnId] = now;
  });

  // ---- MOUSE POLLING RATE (Hz) ----
  const mpZone = container.querySelector("#mp-zone");
  const mpLiveHz = container.querySelector("#mp-live-hz");
  const mpPeakHz = container.querySelector("#mp-peak-hz");
  let moveTimestamps = [];
  let peakHz = 0;
  let barHistory = [];

  function renderPollingBars() {
    const existing = mpZone.querySelectorAll(".mp-bar");
    existing.forEach((b) => b.remove());
    barHistory.forEach((hz) => {
      const pct = Math.min(100, Math.round((hz / 1000) * 100));
      const bar = document.createElement("div");
      bar.className = "mp-bar flex-1 rounded-t bg-gradient-to-t from-emerald-500 via-cyan-400 to-fuchsia-500 transition-all";
      bar.style.height = `${Math.max(8, pct)}%`;
      mpZone.appendChild(bar);
    });
  }

  mpZone.addEventListener("pointermove", (e) => {
    const events = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [e];
    const now = performance.now();
    for (let i = 0; i < events.length; i++) {
      moveTimestamps.push(now);
    }
    // Keep last 500ms window
    moveTimestamps = moveTimestamps.filter((t) => now - t <= 500);
    const hz = Math.round(moveTimestamps.length * 2);
    if (hz > peakHz) peakHz = hz;
    mpLiveHz.textContent = `${hz} Hz`;
    mpPeakHz.textContent = `${peakHz} Hz`;

    barHistory.push(hz);
    if (barHistory.length > 28) barHistory.shift();
    renderPollingBars();
  });

  container.querySelector("#mc-reset-btn").addEventListener("click", () => {
    totalClicks = 0;
    faults = 0;
    peakHz = 0;
    moveTimestamps = [];
    barHistory = [];
    Object.keys(lastDownTime).forEach((k) => delete lastDownTime[k]);
    mcTotal.textContent = "0";
    mcFaults.textContent = "0";
    mcGap.textContent = "—";
    mpLiveHz.textContent = "0 Hz";
    mpPeakHz.textContent = "0 Hz";
    mcStatus.textContent = "Flags accidental switch double-clicks under 80ms";
    mcStatus.className = "text-xs text-slate-400 mt-1";
    renderPollingBars();
  });

  // ---- VISUAL KEYBOARD TESTER ----
  const testedKeys = new Set();
  const kbLast = container.querySelector("#kb-last-key");
  const kbCount = container.querySelector("#kb-count");

  function onKeyDown(e) {
    if (!container.isConnected || activeTab !== "key") return;
    if (["Space", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }
    kbLast.textContent = `${e.key === " " ? "Space" : e.key} (${e.code})`;
    testedKeys.add(e.code);
    kbCount.textContent = testedKeys.size;

    const keyEl = container.querySelector(`[data-key-code="${e.code}"]`);
    if (keyEl) {
      keyEl.classList.remove("bg-slate-800/90", "bg-emerald-600", "text-slate-200");
      keyEl.classList.add("bg-cyan-400", "text-slate-950", "scale-95", "shadow-lg", "shadow-cyan-400/40");
    }
  }

  function onKeyUp(e) {
    if (!container.isConnected || activeTab !== "key") return;
    const keyEl = container.querySelector(`[data-key-code="${e.code}"]`);
    if (keyEl) {
      keyEl.classList.remove("bg-cyan-400", "text-slate-950", "scale-95", "shadow-lg", "shadow-cyan-400/40");
      keyEl.classList.add("bg-emerald-600", "text-white", "border-emerald-400");
    }
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  container.querySelector("#kb-reset-btn").addEventListener("click", () => {
    testedKeys.clear();
    kbLast.textContent = "—";
    kbCount.textContent = "0";
    container.querySelectorAll(".kb-key").forEach((k) => {
      k.classList.remove("bg-emerald-600", "bg-cyan-400", "text-white", "text-slate-950", "border-emerald-400");
      k.classList.add("bg-slate-800/90", "text-slate-200");
    });
  });

  // Auto-Cleanup
  window.addEventListener("hashchange", function cleanup() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("hashchange", cleanup);
  });
};