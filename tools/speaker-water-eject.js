window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["speaker-water-eject"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    ejectBtn: isBn ? "ওয়াটার ইজেক্ট শুরু করুন" : "Start Water Eject",
    stopBtn: isBn ? "সাউন্ড বন্ধ করুন" : "Stop Sound",
    modeSteady: isBn ? "১৬৫ হার্জ (স্ট্যান্ডার্ড)" : "165Hz (Standard)",
    modePulse: isBn ? "পালস ওয়েভ (ডিপ ক্লিন)" : "Pulse Wave (Deep Clean)",
    freqLabel: isBn ? "কাস্টম ফ্রিকোয়েন্সি" : "Custom Frequency",
    tip: isBn
      ? "টিপস: ফোনের ভলিউম ১০০% করে স্পিকারটি নিচের দিকে কাত করে ধরুন।"
      : "Tip: Turn volume to 100% and point your phone speaker downward.",
    stereoTitle: isBn ? "হেডফোন ও স্পিকার স্টেরিও টেস্ট (Left / Right)" : "Stereo & Headphone Balance Test",
    left: isBn ? "বাম স্পিকার (L)" : "Left Channel (L)",
    both: isBn ? "উভয় পাশ (Stereo)" : "Both Channels",
    right: isBn ? "ডান স্পিকার (R)" : "Right Channel (R)",
    statusIdle: isBn ? "প্রস্তুত — বাটনে ক্লিক করে শুরু করুন" : "Ready — Click to eject water & dust",
    statusActive: isBn ? "কম্পন চলছে... স্পিকার নিচের দিকে ধরুন" : "Vibrating... Point speaker downward",
    done: isBn ? "সম্পন্ন! প্রয়োজনে আরও একবার চালান।" : "Cycle complete! Repeat if sound still feels muffled."
  };

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Water Eject Visualizer Card -->
      <div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-[#0a142f] to-slate-900 border border-cyan-500/25 text-center text-white">
        <!-- Animated Ripple Rings -->
        <div class="relative w-36 h-36 mx-auto mb-5 flex items-center justify-center">
          <span id="we-ring-1" class="hidden absolute inset-0 rounded-full border-2 border-cyan-400/60 animate-ping"></span>
          <span id="we-ring-2" class="hidden absolute inset-3 rounded-full border-2 border-emerald-400/60 animate-pulse"></span>
          <button id="we-main-btn" class="relative z-10 w-28 h-28 rounded-full btn-gradient-emerald btn-shimmer flex flex-col items-center justify-center shadow-2xl shadow-emerald-500/40 cursor-pointer">
            <i id="we-btn-icon" data-lucide="droplets" class="w-8 h-8 mb-1"></i>
            <span id="we-timer" class="text-xs font-extrabold tracking-wider">30s</span>
          </button>
        </div>

        <h3 id="we-status" class="text-sm sm:text-base font-extrabold text-cyan-200 mb-2">${T.statusIdle}</h3>
        <p class="text-xs text-slate-400 max-w-md mx-auto mb-5">${T.tip}</p>

        <!-- Mode Selector -->
        <div class="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 mb-5 gap-1">
          <button data-we-mode="steady" class="we-mode-btn px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 transition">${T.modeSteady}</button>
          <button data-we-mode="pulse" class="we-mode-btn px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition">${T.modePulse}</button>
        </div>

        <!-- Custom Frequency Slider -->
        <div class="max-w-sm mx-auto mb-5">
          <div class="flex justify-between text-xs font-bold mb-1.5">
            <span class="text-slate-400">${T.freqLabel}</span>
            <span id="we-freq-val" class="text-emerald-400">165 Hz</span>
          </div>
          <input id="we-freq-slider" type="range" min="100" max="450" value="165" class="w-full accent-emerald-400 cursor-pointer" />
        </div>

        <button id="we-toggle-cta" class="btn-gradient-cyber btn-shimmer px-7 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-lg">
          ${T.ejectBtn}
        </button>
      </div>

      <!-- Stereo Left / Right / Center Tester -->
      <div class="rounded-2xl p-5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-sm font-extrabold flex items-center gap-2">
            <i data-lucide="headphones" class="w-4 h-4 text-fuchsia-400"></i>
            <span>${T.stereoTitle}</span>
          </h4>
          <span id="stereo-indicator" class="text-[11px] font-bold text-slate-400">440Hz Tone</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button data-pan="-1" class="stereo-btn btn-gradient-emerald btn-shimmer py-3 px-4 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2">
            <i data-lucide="arrow-left-circle" class="w-4 h-4"></i>
            <span>${T.left}</span>
          </button>
          <button data-pan="0" class="stereo-btn btn-gradient-cyber btn-shimmer py-3 px-4 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2">
            <i data-lucide="volume-2" class="w-4 h-4"></i>
            <span>${T.both}</span>
          </button>
          <button data-pan="1" class="stereo-btn btn-aurora btn-shimmer py-3 px-4 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2">
            <span>${T.right}</span>
            <i data-lucide="arrow-right-circle" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  let audioCtx = null;
  let osc = null;
  let gainNode = null;
  let pulseInterval = null;
  let countdownInterval = null;
  let isPlaying = false;
  let mode = "steady";
  let secondsLeft = 30;

  const mainBtn = container.querySelector("#we-main-btn");
  const toggleCta = container.querySelector("#we-toggle-cta");
  const statusEl = container.querySelector("#we-status");
  const timerEl = container.querySelector("#we-timer");
  const ring1 = container.querySelector("#we-ring-1");
  const ring2 = container.querySelector("#we-ring-2");
  const freqSlider = container.querySelector("#we-freq-slider");
  const freqVal = container.querySelector("#we-freq-val");

  function ensureAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function stopEject(completed = false) {
    isPlaying = false;
    clearInterval(pulseInterval);
    clearInterval(countdownInterval);
    if (osc) {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
      osc = null;
    }
    ring1.classList.add("hidden");
    ring2.classList.add("hidden");
    mainBtn.classList.remove("btn-gradient-rose");
    mainBtn.classList.add("btn-gradient-emerald");
    toggleCta.textContent = T.ejectBtn;
    statusEl.textContent = completed ? T.done : T.statusIdle;
    secondsLeft = 30;
    timerEl.textContent = "30s";
  }

  function startEject() {
    ensureAudioCtx();
    stopEject(false);
    isPlaying = true;
    secondsLeft = 30;
    timerEl.textContent = `${secondsLeft}s`;

    osc = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(Number(freqSlider.value), audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.9, audioCtx.currentTime);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();

    if (mode === "pulse") {
      let high = true;
      pulseInterval = setInterval(() => {
        if (!osc || !audioCtx) return;
        const base = Number(freqSlider.value);
        osc.frequency.setTargetAtTime(high ? base + 35 : base - 20, audioCtx.currentTime, 0.08);
        high = !high;
      }, 320);
    }

    ring1.classList.remove("hidden");
    ring2.classList.remove("hidden");
    mainBtn.classList.remove("btn-gradient-emerald");
    mainBtn.classList.add("btn-gradient-rose");
    toggleCta.textContent = T.stopBtn;
    statusEl.textContent = T.statusActive;

    countdownInterval = setInterval(() => {
      secondsLeft--;
      timerEl.textContent = `${secondsLeft}s`;
      if (secondsLeft <= 0) {
        stopEject(true);
      }
    }, 1000);
  }

  function toggleEject() {
    if (isPlaying) stopEject(false);
    else startEject();
  }

  mainBtn.addEventListener("click", toggleEject);
  toggleCta.addEventListener("click", toggleEject);

  freqSlider.addEventListener("input", () => {
    freqVal.textContent = `${freqSlider.value} Hz`;
    if (osc && audioCtx) {
      osc.frequency.setTargetAtTime(Number(freqSlider.value), audioCtx.currentTime, 0.05);
    }
  });

  container.querySelectorAll(".we-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.getAttribute("data-we-mode");
      container.querySelectorAll(".we-mode-btn").forEach((b) => {
        b.className = "we-mode-btn px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition";
      });
      btn.className = "we-mode-btn px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 transition";
      if (isPlaying) startEject();
    });
  });

  // Stereo Channel Beep Test
  container.querySelectorAll(".stereo-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      ensureAudioCtx();
      const panVal = Number(btn.getAttribute("data-pan"));
      const indicator = container.querySelector("#stereo-indicator");
      indicator.textContent = panVal === -1 ? "Playing Left (L)..." : panVal === 1 ? "Playing Right (R)..." : "Playing Both (L+R)...";

      const testOsc = audioCtx.createOscillator();
      const testGain = audioCtx.createGain();
      testOsc.type = "triangle";
      testOsc.frequency.setValueAtTime(panVal === -1 ? 440 : panVal === 1 ? 523.25 : 493.88, audioCtx.currentTime);

      testGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      testGain.gain.exponentialRampToValueAtTime(0.55, audioCtx.currentTime + 0.05);
      testGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.1);

      if (typeof audioCtx.createStereoPanner === "function") {
        const panner = audioCtx.createStereoPanner();
        panner.pan.setValueAtTime(panVal, audioCtx.currentTime);
        testOsc.connect(testGain).connect(panner).connect(audioCtx.destination);
      } else {
        testOsc.connect(testGain).connect(audioCtx.destination);
      }

      testOsc.start();
      testOsc.stop(audioCtx.currentTime + 1.15);
      setTimeout(() => {
        if (container.isConnected) indicator.textContent = "440Hz Tone";
      }, 1200);
    });
  });

  // Auto-Cleanup when navigating away
  window.addEventListener("hashchange", function cleanup() {
    stopEject(false);
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    window.removeEventListener("hashchange", cleanup);
  });
};