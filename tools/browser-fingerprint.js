window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["browser-fingerprint"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    fpId: isBn ? "আপনার ইউনিক ব্রাউজার ফিঙ্গারপ্রিন্ট ID" : "Your Unique Browser Fingerprint ID",
    copyHash: isBn ? "হ্যাশ কপি" : "Copy Hash",
    copyJson: isBn ? "সম্পূর্ণ JSON কপি" : "Copy Full JSON",
    copied: isBn ? "কপি হয়েছে!" : "Copied!",
    uaTitle: isBn ? "User-Agent ও Client Hints" : "User-Agent & Client Hints",
    hwTitle: isBn ? "ডিভাইস, GPU ও ডিসপ্লে সিগনেচার" : "Hardware, GPU & Screen Signature",
    canvasTitle: isBn ? "ক্যানভাস ও প্রাইভেসি অ্যাট্রিবিউট" : "Canvas Hash & Privacy Flags"
  };

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Composite Fingerprint Hero Card -->
      <div class="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-[#121238] to-slate-900 border border-indigo-500/35 text-white">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
          <span class="px-3 py-1 rounded-full text-[10px] font-extrabold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30">
            SHA-256 COMPOSITE SIGNATURE
          </span>
          <div class="flex items-center gap-2">
            <button id="fp-copy-hash" class="btn-glass px-3 py-1.5 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5">
              <i data-lucide="copy" class="w-3.5 h-3.5 text-cyan-400"></i> <span>${T.copyHash}</span>
            </button>
            <button id="fp-copy-json" class="btn-gradient-cyber btn-shimmer px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white inline-flex items-center gap-1.5">
              <i data-lucide="braces" class="w-3.5 h-3.5"></i> <span>${T.copyJson}</span>
            </button>
          </div>
        </div>

        <div class="text-[11px] font-bold text-slate-400 uppercase">${T.fpId}</div>
        <div id="fp-main-hash" class="text-lg sm:text-2xl font-mono font-extrabold break-all bg-gradient-to-r from-emerald-400 via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent mt-1">
          Generating fingerprint...
        </div>

        <!-- Quick Telemetry Chips -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10 text-center">
          <div class="p-2.5 rounded-xl bg-white/5">
            <div class="text-[10px] text-slate-400 font-bold uppercase">CPU Cores</div>
            <div id="fp-cpu" class="text-sm font-extrabold text-emerald-400 mt-0.5">—</div>
          </div>
          <div class="p-2.5 rounded-xl bg-white/5">
            <div class="text-[10px] text-slate-400 font-bold uppercase">Memory (RAM)</div>
            <div id="fp-ram" class="text-sm font-extrabold text-cyan-400 mt-0.5">—</div>
          </div>
          <div class="p-2.5 rounded-xl bg-white/5">
            <div class="text-[10px] text-slate-400 font-bold uppercase">Touch Points</div>
            <div id="fp-touch" class="text-sm font-extrabold text-fuchsia-400 mt-0.5">—</div>
          </div>
          <div class="p-2.5 rounded-xl bg-white/5">
            <div class="text-[10px] text-slate-400 font-bold uppercase">Cookies / DNT</div>
            <div id="fp-cookies" class="text-sm font-extrabold text-amber-400 mt-0.5">—</div>
          </div>
        </div>
      </div>

      <!-- User-Agent & Client Hints -->
      <div class="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
        <h4 class="text-xs sm:text-sm font-extrabold flex items-center gap-2">
          <i data-lucide="terminal" class="w-4 h-4 text-cyan-400"></i> ${T.uaTitle}
        </h4>
        <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 font-mono text-xs break-all" id="fp-ua-string">—</div>
        <div id="fp-hints-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"></div>
      </div>

      <!-- Hardware & GPU + Canvas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5">
          <h4 class="text-xs sm:text-sm font-extrabold flex items-center gap-2">
            <i data-lucide="cpu" class="w-4 h-4 text-emerald-400"></i> ${T.hwTitle}
          </h4>
          <div id="fp-hw-list" class="space-y-2 text-xs"></div>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
          <h4 class="text-xs sm:text-sm font-extrabold flex items-center gap-2">
            <i data-lucide="fingerprint" class="w-4 h-4 text-fuchsia-400"></i> ${T.canvasTitle}
          </h4>
          <canvas id="fp-canvas-preview" width="280" height="58" class="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-950"></canvas>
          <div id="fp-privacy-list" class="space-y-2 text-xs"></div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Safe Hash Helper (works even on file:// where crypto.subtle may be absent)
  async function computeHash(inputStr) {
    if (window.crypto && window.crypto.subtle) {
      const data = new TextEncoder().encode(inputStr);
      const buf = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < inputStr.length; i++) {
      const ch = inputStr.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    return ((h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0")).repeat(2);
  }

  function getWebGLInfo() {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      if (!gl) return { vendor: "Disabled", renderer: "Disabled" };
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      return {
        vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
      };
    } catch (e) {
      return { vendor: "Blocked", renderer: "Blocked" };
    }
  }

  function renderCanvasSignature() {
    const c = container.querySelector("#fp-canvas-preview");
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#090f24";
    ctx.fillRect(0, 0, c.width, c.height);

    const grad = ctx.createLinearGradient(0, 0, c.width, 0);
    grad.addColorStop(0, "#10b981");
    grad.addColorStop(0.5, "#06b6d4");
    grad.addColorStop(1, "#ec4899");
    ctx.fillStyle = grad;
    ctx.font = "bold 15px 'Plus Jakarta Sans', Arial, sans-serif";
    ctx.fillText("CheckKit Fingerprint 🔒 2026", 12, 26);

    ctx.strokeStyle = "rgba(250, 204, 21, 0.85)";
    ctx.beginPath();
    ctx.arc(248, 30, 16, 0, Math.PI * 1.65);
    ctx.stroke();

    ctx.fillStyle = "rgba(99, 102, 241, 0.7)";
    ctx.font = "11px monospace";
    ctx.fillText("Canvas2D • Entropy Probe", 12, 46);

    return c.toDataURL();
  }

  function rowHtml(label, val) {
    return `<div class="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5"><span class="text-slate-500 dark:text-slate-400 font-semibold shrink-0">${label}</span><strong class="font-mono text-right truncate">${val}</strong></div>`;
  }

  let reportObj = {};
  let compositeHash = "";

  async function initAudit() {
    const gl = getWebGLInfo();
    const canvasDataUrl = renderCanvasSignature();
    const canvasHash = (await computeHash(canvasDataUrl)).slice(0, 20);

    let highHints = {};
    if (navigator.userAgentData) {
      highHints.platform = navigator.userAgentData.platform || "N/A";
      highHints.mobile = navigator.userAgentData.mobile ? "Yes" : "No";
      highHints.brands = (navigator.userAgentData.brands || []).map((b) => `${b.brand} v${b.version}`).join(", ");
      if (typeof navigator.userAgentData.getHighEntropyValues === "function") {
        try {
          const extra = await navigator.userAgentData.getHighEntropyValues(["architecture", "model", "platformVersion"]);
          highHints.architecture = extra.architecture || "N/A";
          highHints.model = extra.model || "Desktop / Generic";
          highHints.platformVersion = extra.platformVersion || "N/A";
        } catch (e) {}
      }
    }

    reportObj = {
      userAgent: navigator.userAgent,
      platform: navigator.platform || "N/A",
      languages: (navigator.languages || [navigator.language]).join(", "),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "N/A",
      screen: `${screen.width}x${screen.height} @${window.devicePixelRatio || 1}x (${screen.colorDepth}-bit)`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      cpuCores: navigator.hardwareConcurrency || "Hidden",
      deviceMemoryGB: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Hidden",
      maxTouchPoints: navigator.maxTouchPoints || 0,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || "Unset",
      webglVendor: gl.vendor,
      webglRenderer: gl.renderer,
      canvasHash,
      clientHints: highHints
    };

    compositeHash = (await computeHash(JSON.stringify(reportObj))).slice(0, 32).toUpperCase();
    if (!container.isConnected) return;

    container.querySelector("#fp-main-hash").textContent = compositeHash;
    container.querySelector("#fp-cpu").textContent = reportObj.cpuCores;
    container.querySelector("#fp-ram").textContent = reportObj.deviceMemoryGB;
    container.querySelector("#fp-touch").textContent = reportObj.maxTouchPoints;
    container.querySelector("#fp-cookies").textContent = `${reportObj.cookiesEnabled ? "ON" : "OFF"} / ${reportObj.doNotTrack}`;
    container.querySelector("#fp-ua-string").textContent = reportObj.userAgent;

    const hintsGrid = container.querySelector("#fp-hints-grid");
    hintsGrid.innerHTML = [
      rowHtml("Platform", highHints.platform || reportObj.platform),
      rowHtml("Mobile Hint", highHints.mobile || (/Mobi/i.test(navigator.userAgent) ? "Yes" : "No")),
      rowHtml("Architecture", highHints.architecture || "N/A"),
      rowHtml("Device Model", highHints.model || "Browser Default")
    ].join("");

    container.querySelector("#fp-hw-list").innerHTML = [
      rowHtml("GPU Vendor", gl.vendor),
      rowHtml("GPU Renderer", gl.renderer),
      rowHtml("Screen", reportObj.screen),
      rowHtml("Viewport", reportObj.viewport),
      rowHtml("Languages", reportObj.languages)
    ].join("");

    container.querySelector("#fp-privacy-list").innerHTML = [
      rowHtml("Canvas Hash", canvasHash),
      rowHtml("Timezone", reportObj.timezone),
      rowHtml("WebDriver (Bot)", navigator.webdriver ? "Detected (True)" : "Clean (False)")
    ].join("");
  }

  container.querySelector("#fp-copy-hash").addEventListener("click", () => {
    if (!compositeHash) return;
    navigator.clipboard?.writeText(compositeHash);
    const sp = container.querySelector("#fp-copy-hash span");
    sp.textContent = T.copied;
    setTimeout(() => { sp.textContent = T.copyHash; }, 1600);
  });

  container.querySelector("#fp-copy-json").addEventListener("click", () => {
    navigator.clipboard?.writeText(JSON.stringify({ fingerprintId: compositeHash, ...reportObj }, null, 2));
    const sp = container.querySelector("#fp-copy-json span");
    sp.textContent = T.copied;
    setTimeout(() => { sp.textContent = T.copyJson; }, 1600);
  });

  initAudit();
};