window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["ip-webrtc-leak"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    rescan: isBn ? "পুনরায় স্ক্যান করুন" : "Re-Scan Now",
    copyIp: isBn ? "আইপি কপি" : "Copy IP",
    copied: isBn ? "কপি হয়েছে!" : "Copied!",
    scanning: isBn ? "আইপি ও WebRTC লিক পরীক্ষা করা হচ্ছে..." : "Scanning IP, ISP & WebRTC leaks...",
    publicIp: isBn ? "আপনার পাবলিক আইপি" : "Your Public IP",
    ispLabel: isBn ? "আইএসপি / নেটওয়ার্ক" : "ISP / Organization",
    locLabel: isBn ? "লোকেশন" : "Location",
    tzTitle: isBn ? "টাইমজোন সামঞ্জস্যতা (Timezone Check)" : "Timezone Consistency Check",
    ipTz: isBn ? "আইপি টাইমজোন" : "IP Timezone",
    sysTz: isBn ? "ব্রাউজার টাইমজোন" : "Browser Timezone",
    tzMatch: isBn ? "মিলে গেছে (Safe)" : "Matched (Clean)",
    tzMismatch: isBn ? "অমিল ধরা পড়েছে! (VPN/Proxy সন্দেহ)" : "Mismatch Detected! (Proxy/VPN Leak)",
    webrtcTitle: isBn ? "WebRTC লিক অডিট" : "WebRTC Leak Audit",
    webrtcSafe: isBn ? "কোনো পাবলিক WebRTC লিক পাওয়া যায়নি।" : "No external WebRTC IP leak detected.",
    webrtcLeak: isBn ? "সতর্কতা: WebRTC থেকে আপনার আসল আইপি ফাঁস হচ্ছে!" : "Warning: WebRTC is exposing an IP address!",
    webrtcMdns: isBn ? "ব্রাউজার mDNS (.local) দিয়ে আপনার লোকাল আইপি সুরক্ষিত রেখেছে।" : "Protected via browser mDNS (.local obfuscation).",
    vpnAlertTitle: isBn ? "প্রাইভেসি ঝুঁকি শনাক্ত হয়েছে" : "Privacy Exposure Detected",
    vpnAlertDesc: isBn
      ? "আপনার আসল আইপি বা টাইমজোন ওয়েবসাইটগুলো সহজেই দেখতে পাচ্ছে। সম্পূর্ণ সুরক্ষার জন্য একটি বিশ্বস্ত No-Logs VPN ব্যবহার করুন।"
      : "Websites can fingerprint your real IP or timezone mismatch. Protect your traffic with an audited No-Logs VPN.",
    vpnCta: isBn ? "সুরক্ষিত VPN দেখুন →" : "Secure My Connection →",
    errFetch: isBn ? "আইপি তথ্য লোড করা যায়নি। অ্যাড-ব্লকার বন্ধ করে আবার চেষ্টা করুন।" : "Could not fetch IP data. Check connection or ad-blocker."
  };

  const vpnLink = (api.config && api.config.affiliates && api.config.affiliates.privacy && api.config.affiliates.privacy.url) || "#";

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Top Hero IP Card -->
      <div class="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-[#0a1633] to-slate-900 border border-cyan-500/30 text-white relative overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
            <span id="ip-pulse" class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span id="ip-status-pill">${T.scanning}</span>
          </span>
          <div class="flex items-center gap-2">
            <button id="ip-copy-btn" class="btn-glass px-3 py-1.5 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5">
              <i data-lucide="copy" class="w-3.5 h-3.5 text-cyan-400"></i> <span>${T.copyIp}</span>
            </button>
            <button id="ip-rescan-btn" class="btn-gradient-cyber btn-shimmer px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white inline-flex items-center gap-1.5">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> <span>${T.rescan}</span>
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div class="text-[11px] uppercase tracking-wider font-bold text-slate-400">${T.publicIp}</div>
            <div id="ip-main-addr" class="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent mt-1">
              ---.---.---.---
            </div>
          </div>
          <div class="text-left sm:text-right">
            <div class="text-[10px] uppercase font-bold text-slate-400">Privacy Score</div>
            <div id="ip-score" class="text-2xl font-extrabold text-emerald-400">--/100</div>
          </div>
        </div>

        <!-- ISP & Location Details -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10">
          <div class="p-3 rounded-xl bg-white/5">
            <div class="text-[10px] font-bold uppercase text-slate-400">${T.locLabel}</div>
            <div id="ip-loc" class="text-xs sm:text-sm font-extrabold text-white mt-0.5">—</div>
          </div>
          <div class="p-3 rounded-xl bg-white/5">
            <div class="text-[10px] font-bold uppercase text-slate-400">${T.ispLabel}</div>
            <div id="ip-isp" class="text-xs sm:text-sm font-extrabold text-cyan-300 mt-0.5 truncate">—</div>
          </div>
          <div class="p-3 rounded-xl bg-white/5">
            <div class="text-[10px] font-bold uppercase text-slate-400">ASN / Type</div>
            <div id="ip-asn" class="text-xs sm:text-sm font-extrabold text-fuchsia-300 mt-0.5">—</div>
          </div>
        </div>
      </div>

      <!-- Timezone + WebRTC Audit Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Timezone Check -->
        <div class="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h4 class="text-xs sm:text-sm font-extrabold flex items-center gap-2">
              <i data-lucide="clock" class="w-4 h-4 text-cyan-400"></i> ${T.tzTitle}
            </h4>
            <span id="tz-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-white/10 text-slate-500">Checking</span>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">${T.ipTz}</span>
              <strong id="tz-ip-val" class="font-mono">—</strong>
            </div>
            <div class="flex justify-between p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">${T.sysTz}</span>
              <strong id="tz-sys-val" class="font-mono">—</strong>
            </div>
          </div>
        </div>

        <!-- WebRTC Leak Card -->
        <div class="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h4 class="text-xs sm:text-sm font-extrabold flex items-center gap-2">
              <i data-lucide="radio" class="w-4 h-4 text-fuchsia-400"></i> ${T.webrtcTitle}
            </h4>
            <span id="rtc-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-white/10 text-slate-500">Scanning</span>
          </div>
          <p id="rtc-summary" class="text-xs text-slate-500 dark:text-slate-400">Probing STUN ICE candidates...</p>
          <div id="rtc-ip-list" class="space-y-1.5 text-xs font-mono"></div>
        </div>
      </div>

      <!-- Dynamic Risk Affiliate Callout (Triggers automatically on mismatch or leak) -->
      <div id="ip-vpn-callout" class="hidden p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-fuchsia-500/15 border border-rose-500/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <i data-lucide="shield-alert" class="w-6 h-6 text-rose-400 shrink-0 mt-0.5"></i>
          <div>
            <h4 class="text-xs sm:text-sm font-extrabold text-rose-400">${T.vpnAlertTitle}</h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">${T.vpnAlertDesc}</p>
          </div>
        </div>
        <a href="${vpnLink}" target="_blank" rel="sponsored noopener" class="btn-aurora btn-shimmer shrink-0 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white">
          ${T.vpnCta}
        </a>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  let activePc = null;
  let currentIp = "";

  const ipMainEl = container.querySelector("#ip-main-addr");
  const statusPill = container.querySelector("#ip-status-pill");
  const pulseEl = container.querySelector("#ip-pulse");
  const locEl = container.querySelector("#ip-loc");
  const ispEl = container.querySelector("#ip-isp");
  const asnEl = container.querySelector("#ip-asn");
  const scoreEl = container.querySelector("#ip-score");
  const tzIpEl = container.querySelector("#tz-ip-val");
  const tzSysEl = container.querySelector("#tz-sys-val");
  const tzBadge = container.querySelector("#tz-badge");
  const rtcBadge = container.querySelector("#rtc-badge");
  const rtcSummary = container.querySelector("#rtc-summary");
  const rtcList = container.querySelector("#rtc-ip-list");
  const vpnCallout = container.querySelector("#ip-vpn-callout");

  function isPrivateIp(ip) {
    return (
      /^10\./.test(ip) ||
      /^192\.168\./.test(ip) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
      /^127\./.test(ip) ||
      /^fe80:/i.test(ip) ||
      /^fc00:/i.test(ip) ||
      /^fd/i.test(ip)
    );
  }

  async function fetchIpInfo() {
    try {
      const r = await fetch("https://ipwho.is/");
      const d = await r.json();
      if (d && d.success !== false && d.ip) {
        return {
          ip: d.ip,
          city: d.city || "",
          region: d.region || "",
          country: d.country || "",
          code: d.country_code || "",
          isp: (d.connection && (d.connection.isp || d.connection.org)) || "Unknown ISP",
          asn: d.connection && d.connection.asn ? `AS${d.connection.asn} (${d.type || "IPv4"})` : d.type || "IPv4",
          timezone: (d.timezone && d.timezone.id) || ""
        };
      }
    } catch (e) {}

    // Fallback free API
    const r2 = await fetch("https://ipapi.co/json/");
    const d2 = await r2.json();
    return {
      ip: d2.ip || "Unknown",
      city: d2.city || "",
      region: d2.region || "",
      country: d2.country_name || "",
      code: d2.country_code || "",
      isp: d2.org || "Unknown ISP",
      asn: d2.asn || "IPv4",
      timezone: d2.timezone || ""
    };
  }

  function detectWebRTC() {
    return new Promise((resolve) => {
      const RTCPC = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
      if (!RTCPC) {
        resolve({ supported: false, ips: [], mdns: [] });
        return;
      }
      if (activePc) {
        try { activePc.close(); } catch (e) {}
      }

      const foundIps = new Set();
      const foundMdns = new Set();
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        try { activePc.close(); } catch (e) {}
        resolve({ supported: true, ips: Array.from(foundIps), mdns: Array.from(foundMdns) });
      };

      try {
        activePc = new RTCPC({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
        });
        activePc.createDataChannel("checkkit");
        activePc.onicecandidate = (evt) => {
          if (!evt || !evt.candidate) {
            finish();
            return;
          }
          const cand = evt.candidate.candidate || "";
          const ipv4Match = cand.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);
          const mdnsMatch = cand.match(/[a-f0-9-]+\.local/gi);
          if (ipv4Match) ipv4Match.forEach((ip) => foundIps.add(ip));
          if (mdnsMatch) mdnsMatch.forEach((m) => foundMdns.add(m));
        };
        activePc.createOffer().then((offer) => activePc.setLocalDescription(offer)).catch(finish);
        setTimeout(finish, 2600);
      } catch (err) {
        finish();
      }
    });
  }

  async function runFullScan() {
    statusPill.textContent = T.scanning;
    pulseEl.className = "w-2 h-2 rounded-full bg-cyan-400 animate-ping";
    vpnCallout.classList.add("hidden");
    rtcList.innerHTML = "";
    let score = 100;
    let riskTriggered = false;

    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
    tzSysEl.textContent = browserTz;

    let ipData = null;
    try {
      ipData = await fetchIpInfo();
      currentIp = ipData.ip;
      ipMainEl.textContent = ipData.ip;
      locEl.textContent = [ipData.city, ipData.region, ipData.country].filter(Boolean).join(", ");
      ispEl.textContent = ipData.isp;
      asnEl.textContent = ipData.asn;
      tzIpEl.textContent = ipData.timezone || "N/A";

      if (ipData.timezone && ipData.timezone !== browserTz) {
        score -= 25;
        riskTriggered = true;
        tzBadge.textContent = T.tzMismatch;
        tzBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400";
      } else {
        tzBadge.textContent = T.tzMatch;
        tzBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400";
      }
    } catch (e) {
      ipMainEl.textContent = "Unavailable";
      statusPill.textContent = T.errFetch;
      pulseEl.className = "w-2 h-2 rounded-full bg-rose-500";
    }

    const rtc = await detectWebRTC();
    if (!container.isConnected) return;

    const publicLeaks = rtc.ips.filter((ip) => !isPrivateIp(ip));
    const privateLeaks = rtc.ips.filter((ip) => isPrivateIp(ip));
    const mismatchedRealIp = currentIp && publicLeaks.some((ip) => ip !== currentIp);

    if (mismatchedRealIp || publicLeaks.length > 0) {
      score -= mismatchedRealIp ? 45 : 20;
      riskTriggered = true;
      rtcBadge.textContent = mismatchedRealIp ? "CRITICAL LEAK" : "IP EXPOSED";
      rtcBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400";
      rtcSummary.textContent = T.webrtcLeak;
      rtcList.innerHTML = rtc.ips
        .map((ip) => {
          const tag = isPrivateIp(ip) ? "LAN" : "PUBLIC";
          const color = tag === "PUBLIC" ? "text-rose-400 bg-rose-500/15" : "text-amber-400 bg-amber-500/15";
          return `<div class="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-white/5"><span>${ip}</span><span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${color}">${tag}</span></div>`;
        })
        .join("");
    } else if (privateLeaks.length > 0) {
      score -= 10;
      rtcBadge.textContent = "LAN EXPOSED";
      rtcBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400";
      rtcSummary.textContent = T.webrtcSafe;
      rtcList.innerHTML = privateLeaks
        .map((ip) => `<div class="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-white/5"><span>${ip}</span><span class="px-2 py-0.5 rounded text-[10px] font-extrabold text-amber-400 bg-amber-500/15">LOCAL LAN</span></div>`)
        .join("");
    } else {
      rtcBadge.textContent = "PROTECTED";
      rtcBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400";
      rtcSummary.textContent = rtc.mdns.length ? T.webrtcMdns : T.webrtcSafe;
      if (rtc.mdns.length) {
        rtcList.innerHTML = rtc.mdns
          .map((m) => `<div class="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-white/5 truncate"><span class="truncate">${m}</span><span class="px-2 py-0.5 rounded text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15">mDNS SAFE</span></div>`)
          .join("");
      }
    }

    score = Math.max(15, score);
    scoreEl.textContent = `${score}/100`;
    scoreEl.className =
      score >= 80
        ? "text-2xl font-extrabold text-emerald-400"
        : score >= 55
        ? "text-2xl font-extrabold text-amber-400"
        : "text-2xl font-extrabold text-rose-400";

    statusPill.textContent = isBn ? "স্ক্যান সম্পন্ন হয়েছে" : "Live Scan Complete";
    pulseEl.className = "w-2 h-2 rounded-full bg-emerald-400";

    if (riskTriggered) {
      vpnCallout.classList.remove("hidden");
    }
  }

  container.querySelector("#ip-rescan-btn").addEventListener("click", runFullScan);
  container.querySelector("#ip-copy-btn").addEventListener("click", () => {
    if (!currentIp) return;
    navigator.clipboard?.writeText(currentIp);
    const span = container.querySelector("#ip-copy-btn span");
    span.textContent = T.copied;
    setTimeout(() => { span.textContent = T.copyIp; }, 1600);
  });

  runFullScan();

  // Auto-Cleanup
  window.addEventListener("hashchange", function cleanup() {
    if (activePc) {
      try { activePc.close(); } catch (e) {}
      activePc = null;
    }
    window.removeEventListener("hashchange", cleanup);
  });
};