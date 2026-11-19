window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["mic-test"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    start: isBn ? "মাইক্রোফোন চালু করুন" : "Start Microphone Test",
    stop: isBn ? "মাইক বন্ধ করুন" : "Stop Mic",
    record: isBn ? "ভয়েস রেকর্ড করুন" : "Record Clip",
    stopRec: isBn ? "রেকর্ড থামান" : "Stop Recording",
    selectMic: isBn ? "মাইক্রোফোন সিলেক্ট করুন" : "Select Microphone",
    liveLevel: isBn ? "লাইভ ভলিউম" : "Live Input Level",
    peakLevel: isBn ? "সর্বোচ্চ পিক" : "Peak Level",
    statusReady: isBn ? "স্টার্ট বাটনে ক্লিক করে ব্রাউজার পারমিশন দিন" : "Click Start & allow browser microphone access",
    statusLive: isBn ? "মাইক্রোফোন চালু আছে — এখন কথা বলুন!" : "Microphone is LIVE — Speak normally!",
    errPerm: isBn
      ? "মাইক্রোফোন পারমিশন পাওয়া যায়নি। ব্রাউজার সেটিংস চেক করুন (HTTPS প্রয়োজন)।"
      : "Microphone access denied or unavailable. Ensure you are on HTTPS / localhost.",
    playbackTitle: isBn ? "রেকর্ড করা অডিও প্লেব্যাক (১০০% লোকাল)" : "Recorded Playback (100% Local)"
  };

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Top Control Row -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 flex-wrap">
          <button id="mic-toggle-btn" class="btn-gradient-emerald btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-lg">
            <i data-lucide="mic" class="w-4 h-4"></i>
            <span>${T.start}</span>
          </button>
          <button id="mic-rec-btn" disabled class="btn-gradient-pink btn-shimmer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white opacity-40 cursor-not-allowed">
            <i data-lucide="circle-dot" class="w-4 h-4"></i>
            <span>${T.record}</span>
          </button>
        </div>

        <select id="mic-device-select" class="hidden px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 focus:outline-none max-w-[230px]">
          <option value="">${T.selectMic}</option>
        </select>
      </div>

      <!-- Status Pill -->
      <div id="mic-status-bar" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center gap-2">
        <span id="mic-dot" class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
        <span id="mic-status-text">${T.statusReady}</span>
      </div>

      <!-- Neon Canvas Visualizer -->
      <div class="relative rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/25 p-3">
        <canvas id="mic-canvas" class="w-full h-44 block rounded-xl"></canvas>
        <div class="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
          <div>
            <div class="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>${T.liveLevel}</span>
              <span id="mic-db-val" class="text-emerald-400">0%</span>
            </div>
            <div class="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div id="mic-meter-bar" class="h-full w-0 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-500 transition-all duration-75"></div>
            </div>
          </div>
          <div class="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span class="text-[11px] font-bold text-slate-400">${T.peakLevel}</span>
            <span id="mic-peak-val" class="text-sm font-extrabold text-cyan-400">0%</span>
          </div>
        </div>
      </div>

      <!-- Local Playback Drawer -->
      <div id="mic-playback-box" class="hidden p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-emerald-500 flex items-center gap-1.5">
            <i data-lucide="play-circle" class="w-4 h-4"></i> ${T.playbackTitle}
          </span>
          <a id="mic-download-link" download="checkkit-mic-test.webm" class="text-xs font-bold text-cyan-500 hover:underline">Download Audio</a>
        </div>
        <audio id="mic-audio-player" controls class="w-full h-10"></audio>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  let stream = null;
  let audioCtx = null;
  let analyser = null;
  let rafId = null;
  let mediaRecorder = null;
  let chunks = [];
  let peak = 0;

  const toggleBtn = container.querySelector("#mic-toggle-btn");
  const recBtn = container.querySelector("#mic-rec-btn");
  const deviceSelect = container.querySelector("#mic-device-select");
  const statusText = container.querySelector("#mic-status-text");
  const micDot = container.querySelector("#mic-dot");
  const canvas = container.querySelector("#mic-canvas");
  const ctx = canvas.getContext("2d");
  const meterBar = container.querySelector("#mic-meter-bar");
  const dbVal = container.querySelector("#mic-db-val");
  const peakVal = container.querySelector("#mic-peak-val");
  const playbackBox = container.querySelector("#mic-playback-box");
  const audioPlayer = container.querySelector("#mic-audio-player");
  const downloadLink = container.querySelector("#mic-download-link");

  function drawIdleCanvas() {
    canvas.width = canvas.clientWidth || 600;
    canvas.height = canvas.clientHeight || 176;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(34, 211, 238, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }
  drawIdleCanvas();

  async function populateMics() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === "audioinput");
      if (mics.length > 0) {
        deviceSelect.classList.remove("hidden");
        const current = deviceSelect.value;
        deviceSelect.innerHTML = mics
          .map((m, idx) => `<option value="${m.deviceId}">${m.label || "Microphone " + (idx + 1)}</option>`)
          .join("");
        if (current) deviceSelect.value = current;
      }
    } catch (e) {}
  }

  function stopMic() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    cancelAnimationFrame(rafId);
    if (stream) {
      stream.getTracks().forEach((tr) => tr.stop());
      stream = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    toggleBtn.classList.remove("btn-gradient-rose");
    toggleBtn.classList.add("btn-gradient-emerald");
    toggleBtn.querySelector("span").textContent = T.start;
    recBtn.disabled = true;
    recBtn.classList.add("opacity-40", "cursor-not-allowed");
    micDot.className = "w-2.5 h-2.5 rounded-full bg-slate-400";
    statusText.textContent = T.statusReady;
    meterBar.style.width = "0%";
    dbVal.textContent = "0%";
    drawIdleCanvas();
  }

  async function startMic(deviceId = "") {
    stopMic();
    try {
      const constraints = deviceId ? { audio: { deviceId: { exact: deviceId } } } : { audio: true };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      await populateMics();

      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      peak = 0;
      peakVal.textContent = "0%";

      toggleBtn.classList.remove("btn-gradient-emerald");
      toggleBtn.classList.add("btn-gradient-rose");
      toggleBtn.querySelector("span").textContent = T.stop;
      recBtn.disabled = false;
      recBtn.classList.remove("opacity-40", "cursor-not-allowed");
      micDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping";
      statusText.textContent = T.statusLive;

      const freqData = new Uint8Array(analyser.frequencyBinCount);

      function renderLoop() {
        if (!analyser || !container.isConnected) return;
        rafId = requestAnimationFrame(renderLoop);
        analyser.getByteFrequencyData(freqData);

        canvas.width = canvas.clientWidth || 600;
        canvas.height = canvas.clientHeight || 176;
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const bars = 48;
        const step = Math.floor(freqData.length / bars);
        const barW = (canvas.width / bars) - 3;
        let sum = 0;

        for (let i = 0; i < bars; i++) {
          const val = freqData[i * step];
          sum += val;
          const barH = Math.max(4, (val / 255) * (canvas.height - 16));
          const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barH);
          grad.addColorStop(0, "#10b981");
          grad.addColorStop(0.55, "#06b6d4");
          grad.addColorStop(1, "#d946ef");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(i * (barW + 3), canvas.height - barH, barW, barH, 4);
          ctx.fill();
        }

        const avgPct = Math.min(100, Math.round((sum / bars / 180) * 100));
        if (avgPct > peak) peak = avgPct;
        meterBar.style.width = `${avgPct}%`;
        dbVal.textContent = `${avgPct}%`;
        peakVal.textContent = `${peak}%`;
      }
      renderLoop();
    } catch (err) {
      micDot.className = "w-2.5 h-2.5 rounded-full bg-rose-500";
      statusText.textContent = T.errPerm;
    }
  }

  toggleBtn.addEventListener("click", () => {
    if (stream) stopMic();
    else startMic(deviceSelect.value);
  });

  deviceSelect.addEventListener("change", () => {
    if (stream) startMic(deviceSelect.value);
  });

  // Record & Local Playback
  recBtn.addEventListener("click", () => {
    if (!stream) return;
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      recBtn.querySelector("span").textContent = T.record;
      return;
    }

    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      audioPlayer.src = url;
      downloadLink.href = url;
      playbackBox.classList.remove("hidden");
    };
    mediaRecorder.start();
    recBtn.querySelector("span").textContent = T.stopRec;
  });

  // Auto-Cleanup when leaving page
  window.addEventListener("hashchange", function cleanup() {
    stopMic();
    window.removeEventListener("hashchange", cleanup);
  });
};