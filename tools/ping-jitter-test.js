window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["ping-jitter-test"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    startBtn: isBn ? "পিং টেস্ট শুরু করুন (২০ পালস)" : "Start 20-Pulse Ping Test",
    stopBtn: isBn ? "টেস্ট থামান" : "Stop Monitor",
    serverLabel: isBn ? "টেস্ট সার্ভার:" : "Edge Server:",
    livePing: isBn ? "বর্তমান পিং" : "Live Ping",
    avgPing: isBn ? "গড় পিং (Avg)" : "Average Ping",
    jitter: isBn ? "জিটার (Jitter)" : "Jitter",
    minMax: isBn ? "সর্বনিম্ন / সর্বোচ্চ" : "Min / Max",
    gradeTitle: isBn ? "গেমিং ও ভিডিও কল গ্রেড" : "Gaming & Call Stability",
    idleHint: isBn ? "সার্ভার বেছে নিয়ে স্টার্ট বাটনে ক্লিক করুন" : "Select an edge server and start live latency monitoring"
  };

  const endpoints = [
    { name: "Cloudflare Global Edge (1.1.1.1)", url: "https://1.1.1.1/cdn-cgi/trace" },
    { name: "Google Edge (Global CDN)", url: "https://www.google.com/generate_204" },
    { name: "GitHub Fastly CDN", url: "https://github.githubassets.com/favicon.ico" }
  ];

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Top Control Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 flex-1 min-w-[210px]">
          <span class="text-xs font-bold text-slate-400 shrink-0">${T.serverLabel}</span>
          <select id="ping-server-select" class="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 focus:outline-none">
            ${endpoints.map((ep, i) => `<option value="${i}" class="text-slate-900">${ep.name}</option>`).join("")}
          </select>
        </div>
        <button id="ping-toggle-btn" class="btn-gradient-emerald btn-shimmer px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white inline-flex items-center gap-2 shadow-lg">
          <i data-lucide="activity" class="w-4 h-4"></i>
          <span>${T.startBtn}</span>
        </button>
      </div>

      <!-- 4 Live Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
          <div class="text-[10px] font-bold uppercase text-slate-400">${T.livePing}</div>
          <div id="pg-live" class="text-2xl font-extrabold text-emerald-400 mt-0.5">—</div>
        </div>
        <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
          <div class="text-[10px] font-bold uppercase text-slate-400">${T.avgPing}</div>
          <div id="pg-avg" class="text-2xl font-extrabold text-cyan-400 mt-0.5">—</div>
        </div>
        <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
          <div class="text-[10px] font-bold uppercase text-slate-400">${T.jitter}</div>
          <div id="pg-jitter" class="text-2xl font-extrabold text-fuchsia-400 mt-0.5">—</div>
        </div>
        <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
          <div class="text-[10px] font-bold uppercase text-slate-400">${T.minMax}</div>
          <div id="pg-minmax" class="text-sm sm:text-base font-extrabold text-amber-400 mt-2">—</div>
        </div>
      </div>

      <!-- Live Latency Graph Canvas -->
      <div class="rounded-2xl p-4 bg-slate-950 border border-cyan-500/25 space-y-3">
        <div class="flex items-center justify-between text-xs font-bold">
          <span id="pg-progress-text" class="text-slate-400">${T.idleHint}</span>
          <span id="pg-grade-pill" class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/10 text-slate-300">${T.gradeTitle}: —</span>
        </div>
        <canvas id="pg-canvas" class="w-full h-44 block rounded-xl"></canvas>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  let isRunning = false;
  let abortFlag = false;
  let samples = [];

  const serverSelect = container.querySelector("#ping-server-select");
  const toggleBtn = container.querySelector("#ping-toggle-btn");
  const liveEl = container.querySelector("#pg-live");
  const avgEl = container.querySelector("#pg-avg");
  const jitterEl = container.querySelector("#pg-jitter");
  const minmaxEl = container.querySelector("#pg-minmax");
  const progressText = container.querySelector("#pg-progress-text");
  const gradePill = container.querySelector("#pg-grade-pill");
  const canvas = container.querySelector("#pg-canvas");
  const ctx = canvas.getContext("2d");

  function drawChart() {
    canvas.width = canvas.clientWidth || 600;
    canvas.height = canvas.clientHeight || 176;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, w, h);

    // Subtle horizontal grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (samples.length === 0) return;
    const maxVal = Math.max(120, ...samples) * 1.15;
    const stepX = w / 20;

    // Area gradient under line
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(6, 182, 212, 0.35)");
    grad.addColorStop(1, "rgba(16, 185, 129, 0.02)");

    ctx.beginPath();
    samples.forEach((ms, idx) => {
      const x = idx * stepX + stepX / 2;
      const y = h - Math.min(h - 10, (ms / maxVal) * (h - 20)) - 6;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill area
    const lastX = (samples.length - 1) * stepX + stepX / 2;
    ctx.lineTo(lastX, h);
    ctx.lineTo(stepX / 2, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw glowing dots
    samples.forEach((ms, idx) => {
      const x = idx * stepX + stepX / 2;
      const y = h - Math.min(h - 10, (ms / maxVal) * (h - 20)) - 6;
      ctx.fillStyle = ms < 60 ? "#34d399" : ms < 130 ? "#fbbf24" : "#f43f5e";
      ctx.beginPath();
      ctx.arc(x, y, 3.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  drawChart();

  async function measureSinglePing(baseUrl) {
    const t0 = performance.now();
    try {
      await fetch(`${baseUrl}?ck_ping=${Date.now()}_${Math.random()}`, {
        mode: "no-cors",
        cache: "no-store"
      });
    } catch (e) {}
    return Math.max(1, Math.round(performance.now() - t0));
  }

  function updateStats() {
    if (!samples.length) return;
    const latest = samples[samples.length - 1];
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);

    let jitter = 0;
    if (samples.length > 1) {
      let diffSum = 0;
      for (let i = 1; i < samples.length; i++) {
        diffSum += Math.abs(samples[i] - samples[i - 1]);
      }
      jitter = Math.round(diffSum / (samples.length - 1));
    }

    liveEl.textContent = `${latest} ms`;
    avgEl.textContent = `${avg} ms`;
    jitterEl.textContent = `${jitter} ms`;
    minmaxEl.textContent = `${min} / ${max} ms`;

    if (avg <= 55 && jitter <= 15) {
      gradePill.textContent = `${T.gradeTitle}: A+ (Esports Ready)`;
      gradePill.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400";
    } else if (avg <= 120 && jitter <= 30) {
      gradePill.textContent = `${T.gradeTitle}: B+ (Smooth Calls)`;
      gradePill.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300";
    } else {
      gradePill.textContent = `${T.gradeTitle}: C (High Latency / Spikes)`;
      gradePill.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400";
    }
    drawChart();
  }

  function stopTest() {
    abortFlag = true;
    isRunning = false;
    toggleBtn.classList.remove("btn-gradient-rose");
    toggleBtn.classList.add("btn-gradient-emerald");
    toggleBtn.querySelector("span").textContent = T.startBtn;
  }

  async function startTest() {
    if (isRunning) {
      stopTest();
      return;
    }
    isRunning = true;
    abortFlag = false;
    samples = [];
    drawChart();

    toggleBtn.classList.remove("btn-gradient-emerald");
    toggleBtn.classList.add("btn-gradient-rose");
    toggleBtn.querySelector("span").textContent = T.stopBtn;

    const ep = endpoints[Number(serverSelect.value)] || endpoints[0];
    progressText.textContent = isBn ? "কানেকশন ওয়ার্ম-আপ হচ্ছে..." : "Warming up TLS connection...";

    // 1 warm-up pulse (excluded from stats for accuracy)
    await measureSinglePing(ep.url);

    for (let i = 1; i <= 20; i++) {
      if (abortFlag || !container.isConnected) break;
      progressText.textContent = isBn ? `পালস ${i}/20 পরিমাপ চলছে...` : `Measuring pulse ${i} of 20...`;
      const ms = await measureSinglePing(ep.url);
      if (abortFlag || !container.isConnected) break;
      samples.push(ms);
      updateStats();
      await new Promise((r) => setTimeout(r, 260));
    }

    if (container.isConnected && !abortFlag) {
      progressText.textContent = isBn ? "২০টি পালস টেস্ট সম্পন্ন!" : "20-pulse stability audit complete!";
    }
    stopTest();
  }

  toggleBtn.addEventListener("click", startTest);

  // Auto-Cleanup
  window.addEventListener("hashchange", function cleanup() {
    stopTest();
    window.removeEventListener("hashchange", cleanup);
  });
};