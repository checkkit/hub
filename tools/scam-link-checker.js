window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["scam-link-checker"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    placeholder: isBn ? "সন্দেহজনক লিংক পেস্ট করুন (যেমন: https://bit.ly/... বা অফার লিংক)" : "Paste any suspicious link (e.g. https://bit.ly/... or SMS URL)",
    scanBtn: isBn ? "লিংক স্ক্যান করুন" : "Scan URL Safety",
    demoPhish: isBn ? "ভুয়া লিংক ডেমো" : "Test Phishing Sample",
    demoSafe: isBn ? "নিরাপদ লিংক ডেমো" : "Test Safe Sample",
    scoreLabel: isBn ? "সুরক্ষা স্কোর" : "Safety Score",
    checksTitle: isBn ? "বিস্তারিত সিকিউরিটি বিশ্লেষণ" : "Detailed Security Inspection",
    domainAge: isBn ? "ডোমেইন রেজিস্ট্রেশন / বয়স" : "Domain Registration / Age",
    expandedLabel: isBn ? "আসল গন্তব্য (Expanded URL)" : "Final Destination URL",
    workerNote: isBn
      ? "টিপস: শর্ট লিংক (bit.ly) সরাসরি আনফোল্ড করতে config.js-এ ফ্রি Cloudflare Worker যুক্ত করা যাবে।"
      : "Tip: Connect a free Cloudflare Worker in config.js to follow live redirects on shortened URLs.",
    invalidUrl: isBn ? "সঠিক ওয়েবসাইট লিংক দিন (যেমন example.com বা https://...)" : "Please enter a valid URL (e.g. example.com or https://...)"
  };

  const secAffUrl =
    (api.config && api.config.affiliates && api.config.affiliates.security && api.config.affiliates.security.url) || "#";

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Scanner Input Box -->
      <form id="sl-form" class="space-y-3">
        <div class="flex flex-col sm:flex-row gap-2.5">
          <div class="relative flex-1">
            <i data-lucide="link-2" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
            <input
              id="sl-input"
              type="text"
              required
              placeholder="${T.placeholder}"
              class="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>
          <button type="submit" class="btn-gradient-cyber btn-shimmer px-6 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold text-white inline-flex items-center justify-center gap-2 shrink-0 shadow-lg">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
            <span>${T.scanBtn}</span>
          </button>
        </div>

        <!-- Quick Test Chips -->
        <div class="flex flex-wrap items-center gap-2 text-[11px]">
          <span class="text-slate-400 font-bold">Quick Test:</span>
          <button type="button" data-sample="http://bkash-bonus-verify.login-claim.xyz/account@secure" class="sl-sample-btn px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/25 font-bold hover:bg-rose-500/20 transition">${T.demoPhish}</button>
          <button type="button" data-sample="https://github.com/features" class="sl-sample-btn px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold hover:bg-emerald-500/20 transition">${T.demoSafe}</button>
        </div>
      </form>

      <!-- Results Container -->
      <div id="sl-results" class="hidden space-y-4">
        <!-- Verdict Banner -->
        <div id="sl-verdict-card" class="rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <span id="sl-verdict-pill" class="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase"></span>
            <h3 id="sl-verdict-title" class="text-lg font-extrabold"></h3>
            <p id="sl-parsed-host" class="text-xs font-mono opacity-80 break-all"></p>
          </div>
          <div class="text-left sm:text-right shrink-0">
            <div class="text-[10px] uppercase font-bold opacity-75">${T.scoreLabel}</div>
            <div id="sl-score-num" class="text-4xl font-extrabold font-mono">--</div>
          </div>
        </div>

        <!-- Expanded Destination / Domain Age Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <div class="text-[10px] font-bold uppercase text-slate-400">${T.domainAge}</div>
            <div id="sl-age-val" class="text-xs sm:text-sm font-extrabold text-cyan-400 mt-1">Checking RDAP...</div>
          </div>
          <div class="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <div class="text-[10px] font-bold uppercase text-slate-400">${T.expandedLabel}</div>
            <div id="sl-expanded-val" class="text-xs font-mono font-bold text-emerald-400 mt-1 break-all">—</div>
          </div>
        </div>

        <!-- Checklist Findings -->
        <div class="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
          <h4 class="text-xs sm:text-sm font-extrabold flex items-center gap-2">
            <i data-lucide="list-checks" class="w-4 h-4 text-cyan-400"></i> ${T.checksTitle}
          </h4>
          <div id="sl-checks-list" class="space-y-2 text-xs"></div>
        </div>

        <!-- High-Risk Security Affiliate Banner -->
        <div id="sl-danger-cta" class="hidden p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 to-fuchsia-500/15 border border-rose-500/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p class="text-xs font-bold text-rose-300">
            ${isBn ? "এই লিংকে ঝুঁকি পাওয়া গেছে! কখনোই অপরিচিত লিংকে পাসওয়ার্ড বা ওটিপি (OTP) দেবেন না।" : "High phishing risk detected! Never enter passwords, card numbers, or OTPs on this link."}
          </p>
          <a href="${secAffUrl}" target="_blank" rel="sponsored noopener" class="btn-aurora btn-shimmer shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold text-white">
            ${isBn ? "সিকিউরিটি টুল দেখুন →" : "Get Phishing Protection →"}
          </a>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const shorteners = new Set(["bit.ly", "tinyurl.com", "t.co", "rb.gy", "cutt.ly", "is.gd", "shorturl.at", "ow.ly", "rebrand.ly", "tiny.cc"]);
  const riskyTlds = new Set(["tk", "ml", "ga", "cf", "gq", "xyz", "top", "click", "zip", "mov", "buzz", "icu", "cam", "loan", "work", "rest", "cfd"]);
  const protectedBrands = [
    { name: "paypal", official: "paypal.com" },
    { name: "google", official: "google.com" },
    { name: "apple", official: "apple.com" },
    { name: "amazon", official: "amazon.com" },
    { name: "microsoft", official: "microsoft.com" },
    { name: "facebook", official: "facebook.com" },
    { name: "instagram", official: "instagram.com" },
    { name: "netflix", official: "netflix.com" },
    { name: "binance", official: "binance.com" },
    { name: "bkash", official: "bkash.com" },
    { name: "nagad", official: "nagad.com.bd" },
    { name: "daraz", official: "daraz.com.bd" }
  ];
  const phishWords = ["login", "verify", "secure", "account", "update", "bonus", "claim", "free-gift", "suspend", "kyc", "wallet", "banking", "otp", "prize"];

  const inputEl = container.querySelector("#sl-input");
  const resultsEl = container.querySelector("#sl-results");
  const verdictCard = container.querySelector("#sl-verdict-card");
  const verdictPill = container.querySelector("#sl-verdict-pill");
  const verdictTitle = container.querySelector("#sl-verdict-title");
  const parsedHostEl = container.querySelector("#sl-parsed-host");
  const scoreNumEl = container.querySelector("#sl-score-num");
  const ageValEl = container.querySelector("#sl-age-val");
  const expandedValEl = container.querySelector("#sl-expanded-val");
  const checksListEl = container.querySelector("#sl-checks-list");
  const dangerCta = container.querySelector("#sl-danger-cta");

  function normalizeUrl(raw) {
    let s = raw.trim();
    if (!/^https?:\/\//i.test(s)) s = "https://" + s;
    return new URL(s);
  }

  function getRootDomain(host) {
    const parts = host.toLowerCase().split(".");
    if (parts.length <= 2) return host.toLowerCase();
    const last2 = parts.slice(-2).join(".");
    if (["com.bd", "co.uk", "com.au", "co.in"].includes(last2) && parts.length >= 3) {
      return parts.slice(-3).join(".");
    }
    return last2;
  }

  async function lookupDomainAge(rootDomain) {
    const workerUrl = api.config && api.config.backend && api.config.backend.cloudflareWorkerUrl;
    if (workerUrl) {
      try {
        const r = await fetch(`${workerUrl}?url=${encodeURIComponent("https://" + rootDomain)}`);
        const d = await r.json();
        if (d.createdDate) return d.createdDate;
      } catch (e) {}
    }
    // Free public RDAP fallback (works natively for .com/.net/.org/etc.)
    try {
      const r = await fetch(`https://rdap.org/domain/${encodeURIComponent(rootDomain)}`);
      if (!r.ok) return null;
      const data = await r.json();
      const ev = (data.events || []).find((e) => e.eventAction === "registration");
      if (ev && ev.eventDate) {
        const created = new Date(ev.eventDate);
        const days = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
        const years = (days / 365).toFixed(1);
        return { dateStr: created.toISOString().slice(0, 10), days, years };
      }
    } catch (e) {}
    return null;
  }

  async function analyzeUrl(rawInput) {
    let urlObj;
    try {
      urlObj = normalizeUrl(rawInput);
    } catch (e) {
      alert(T.invalidUrl);
      return;
    }

    const full = urlObj.href;
    const host = urlObj.hostname.toLowerCase();
    const root = getRootDomain(host);
    const tld = host.split(".").pop() || "";
    const checks = [];
    let score = 100;

    // 1. HTTPS Check
    if (urlObj.protocol === "https:") {
      checks.push({ ok: true, text: "Uses encrypted HTTPS protocol." });
    } else {
      score -= 20;
      checks.push({ ok: false, text: "Unencrypted HTTP connection — unsafe for logins or payments." });
    }

    // 2. Raw IP Host Check
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      score -= 40;
      checks.push({ ok: false, text: "Uses a raw IP address instead of a legitimate domain name." });
    } else {
      checks.push({ ok: true, text: "Valid domain structure (not a raw IP host)." });
    }

    // 3. @ Credential Obfuscation Check
    if (rawInput.includes("@")) {
      score -= 35;
      checks.push({ ok: false, text: "Contains '@' redirect trick commonly used to disguise fake URLs." });
    }

    // 4. Punycode / Lookalike IDN Check
    if (host.includes("xn--")) {
      score -= 35;
      checks.push({ ok: false, text: "Punycode (xn--) detected — possible lookalike homograph attack." });
    }

    // 5. URL Shortener Check
    const isShort = shorteners.has(root);
    if (isShort) {
      score -= 15;
      checks.push({ ok: false, text: `Shortened link (${root}) hides its real final destination.` });
    }

    // 6. Risky TLD Check
    if (riskyTlds.has(tld)) {
      score -= 22;
      checks.push({ ok: false, text: `High-risk top-level domain (.${tld}) frequently abused in spam campaigns.` });
    }

    // 7. Brand Spoofing Check
    const spoofed = protectedBrands.find((b) => full.toLowerCase().includes(b.name) && root !== b.official);
    if (spoofed) {
      score -= 45;
      checks.push({
        ok: false,
        text: `Possible Brand Impersonation: mentions "${spoofed.name}" but root domain is "${root}" (Official: ${spoofed.official}).`
      });
    }

    // 8. Subdomain Depth & Phishing Keywords
    const subCount = host.split(".").length - 2;
    if (subCount >= 3) {
      score -= 18;
      checks.push({ ok: false, text: `Excessive subdomains (${subCount}) designed to confuse mobile users.` });
    }

    const hitWords = phishWords.filter((w) => full.toLowerCase().includes(w));
    if (hitWords.length >= 2) {
      score -= 18;
      checks.push({ ok: false, text: `Multiple urgency/phishing keywords found: ${hitWords.slice(0, 4).join(", ")}.` });
    }

    score = Math.max(0, Math.min(100, score));

    // Render Verdict
    resultsEl.classList.remove("hidden");
    parsedHostEl.textContent = `Root Domain: ${root}  •  Host: ${host}`;
    scoreNumEl.textContent = `${score}/100`;
    dangerCta.classList.toggle("hidden", score >= 70);

    if (score >= 80) {
      verdictCard.className = "rounded-2xl p-5 border bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4";
      verdictPill.textContent = "LOW RISK";
      verdictPill.className = "inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white";
      verdictTitle.textContent = isBn ? "লিংকটি প্রাথমিকভাবে নিরাপদ মনে হচ্ছে" : "Looks Clean & Low Risk";
    } else if (score >= 50) {
      verdictCard.className = "rounded-2xl p-5 border bg-amber-500/10 border-amber-500/35 text-amber-600 dark:text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4";
      verdictPill.textContent = "CAUTION";
      verdictPill.className = "inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950";
      verdictTitle.textContent = isBn ? "সতর্ক থাকুন — সন্দেহজনক লক্ষণ আছে" : "Proceed With Caution";
    } else {
      verdictCard.className = "rounded-2xl p-5 border bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4";
      verdictPill.textContent = "HIGH SCAM RISK";
      verdictPill.className = "inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-600 text-white";
      verdictTitle.textContent = isBn ? "সতর্কতা! এটি ফিশিং বা স্ক্যাম লিংক হতে পারে" : "Danger: High Phishing / Scam Risk";
    }

    checksListEl.innerHTML = checks
      .map(
        (c) => `
        <div class="flex items-start gap-2.5 p-2.5 rounded-xl ${c.ok ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "bg-rose-500/10 text-rose-600 dark:text-rose-300"}">
          <i data-lucide="${c.ok ? "check-circle-2" : "alert-triangle"}" class="w-4 h-4 shrink-0 mt-0.5"></i>
          <span class="font-semibold">${c.text}</span>
        </div>`
      )
      .join("");
    if (window.lucide) lucide.createIcons();

    // Expanded URL check (via Cloudflare Worker if configured)
    const workerUrl = api.config && api.config.backend && api.config.backend.cloudflareWorkerUrl;
    if (isShort && workerUrl) {
      expandedValEl.textContent = "Unfolding redirect via Worker...";
      try {
        const wRes = await fetch(`${workerUrl}?url=${encodeURIComponent(full)}`);
        const wData = await wRes.json();
        expandedValEl.textContent = wData.finalUrl || full;
      } catch (e) {
        expandedValEl.textContent = full;
      }
    } else if (isShort) {
      expandedValEl.textContent = T.workerNote;
    } else {
      expandedValEl.textContent = full;
    }

    // Domain Age Lookup via RDAP
    ageValEl.textContent = "Checking RDAP registry...";
    const ageInfo = await lookupDomainAge(root);
    if (!container.isConnected) return;
    if (ageInfo && ageInfo.dateStr) {
      ageValEl.textContent = `Registered ${ageInfo.dateStr} (${ageInfo.days < 60 ? "NEW DOMAIN ⚠" : `${ageInfo.years} yrs old`})`;
      if (ageInfo.days < 60) {
        ageValEl.className = "text-xs sm:text-sm font-extrabold text-rose-400 mt-1";
      }
    } else {
      ageValEl.textContent = isBn ? "পাবলিক RDAP তথ্য পাওয়া যায়নি" : "Private / RDAP not exposed";
    }
  }

  container.querySelector("#sl-form").addEventListener("submit", (e) => {
    e.preventDefault();
    analyzeUrl(inputEl.value);
  });

  container.querySelectorAll(".sl-sample-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      inputEl.value = btn.getAttribute("data-sample");
      analyzeUrl(inputEl.value);
    });
  });
};