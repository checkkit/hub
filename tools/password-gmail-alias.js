window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["password-gmail-alias"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    tabPass: isBn ? "পাসওয়ার্ড জেনারেটর" : "Strong Password Generator",
    tabGmail: isBn ? "জিমেইল অ্যালিয়াস মেকার" : "Gmail Dot & Plus Aliases",
    generate: isBn ? "নতুন তৈরি করুন" : "Generate",
    copy: isBn ? "কপি" : "Copy",
    copied: isBn ? "কপি হয়েছে!" : "Copied!",
    length: isBn ? "পাসওয়ার্ড দৈর্ঘ্য" : "Password Length",
    entropy: isBn ? "এনট্রপি স্কোর" : "Entropy",
    crackTime: isBn ? "হ্যাক করতে সময় লাগবে" : "Est. Brute-Force Time",
    gmailInputLabel: isBn ? "আপনার জিমেইল দিন (সব মেইল আপনার আসল ইনবক্সেই আসবে)" : "Enter Your Gmail Address (All mail routes to your real inbox)",
    genAliasBtn: isBn ? "অ্যালিয়াস তৈরি করুন" : "Generate Aliases",
    copyAll: isBn ? "সব কপি করুন" : "Copy All",
    exportTxt: isBn ? "TXT ডাউনলোড" : "Export TXT",
    exportCsv: isBn ? "CSV ডাউনলোড" : "Export CSV",
    customTagPlaceholder: isBn ? "কাস্টম ট্যাগ (যেমন: daraz, netflix)" : "Custom +tag (e.g. amazon, trial)"
  };

  container.innerHTML = `
    <div class="space-y-5">
      <!-- 2-in-1 Tab Switcher -->
      <div class="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <button id="pg-tab-pass" class="btn-gradient-emerald text-white py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2">
          <i data-lucide="key-round" class="w-4 h-4"></i> <span>${T.tabPass}</span>
        </button>
        <button id="pg-tab-gmail" class="text-slate-600 dark:text-slate-300 py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2">
          <i data-lucide="mail-plus" class="w-4 h-4"></i> <span>${T.tabGmail}</span>
        </button>
      </div>

      <!-- PANEL 1: CRYPTOGRAPHIC PASSWORD GENERATOR -->
      <div id="pg-panel-pass" class="space-y-5">
        <!-- Generated Password Output Card -->
        <div class="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-[#0b1633] to-slate-900 border border-emerald-500/30 text-white space-y-4">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input id="pw-output" type="text" readonly class="flex-1 px-4 py-3.5 rounded-xl bg-black/45 border border-white/15 font-mono text-base sm:text-lg font-extrabold text-emerald-300 focus:outline-none select-all" />
            <div class="flex gap-2 shrink-0">
              <button id="pw-copy-btn" class="btn-gradient-emerald btn-shimmer flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-extrabold text-white inline-flex items-center justify-center gap-1.5">
                <i data-lucide="copy" class="w-4 h-4"></i> <span>${T.copy}</span>
              </button>
              <button id="pw-gen-btn" class="btn-gradient-cyber btn-shimmer px-4 py-3 rounded-xl text-xs font-extrabold text-white inline-flex items-center justify-center gap-1.5">
                <i data-lucide="refresh-cw" class="w-4 h-4"></i> <span>${T.generate}</span>
              </button>
            </div>
          </div>

          <!-- Strength Meter & Crack Time -->
          <div class="space-y-2">
            <div class="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div id="pw-strength-bar" class="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"></div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span class="text-slate-400">${T.entropy}: <strong id="pw-entropy" class="text-cyan-300 font-mono">—</strong></span>
              <span class="text-slate-400">${T.crackTime}: <strong id="pw-crack" class="text-emerald-400 font-extrabold">—</strong></span>
            </div>
          </div>
        </div>

        <!-- Customizer Controls -->
        <div class="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4">
          <div>
            <div class="flex justify-between text-xs font-extrabold mb-1.5">
              <span>${T.length}</span>
              <span id="pw-len-val" class="text-cyan-500 font-mono text-sm">18</span>
            </div>
            <input id="pw-len-slider" type="range" min="8" max="64" value="18" class="w-full accent-emerald-500 cursor-pointer" />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold">
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 cursor-pointer">
              <input id="pw-upper" type="checkbox" checked class="accent-emerald-500 w-4 h-4" /> Uppercase (A-Z)
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 cursor-pointer">
              <input id="pw-lower" type="checkbox" checked class="accent-emerald-500 w-4 h-4" /> Lowercase (a-z)
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 cursor-pointer">
              <input id="pw-num" type="checkbox" checked class="accent-emerald-500 w-4 h-4" /> Numbers (0-9)
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 cursor-pointer">
              <input id="pw-sym" type="checkbox" checked class="accent-emerald-500 w-4 h-4" /> Symbols (!@#$%)
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 cursor-pointer sm:col-span-2">
              <input id="pw-no-ambig" type="checkbox" class="accent-cyan-500 w-4 h-4" /> Exclude Ambiguous (O, 0, l, 1, I)
            </label>
          </div>
        </div>
      </div>

      <!-- PANEL 2: GMAIL DOT & PLUS ALIAS GENERATOR -->
      <div id="pg-panel-gmail" class="hidden space-y-5">
        <div class="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3.5">
          <label class="block text-xs font-extrabold text-slate-500 dark:text-slate-300">${T.gmailInputLabel}</label>
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <input id="gm-email-input" type="email" placeholder="yourname@gmail.com" class="sm:col-span-6 px-4 py-3 rounded-xl text-sm font-mono bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <input id="gm-tag-input" type="text" placeholder="${T.customTagPlaceholder}" class="sm:col-span-3 px-3.5 py-3 rounded-xl text-xs font-mono bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/15 focus:outline-none" />
            <button id="gm-gen-btn" class="sm:col-span-3 btn-aurora btn-shimmer py-3 px-4 rounded-xl text-xs font-extrabold text-white shadow-lg">${T.genAliasBtn}</button>
          </div>
        </div>

        <!-- Generated Aliases List -->
        <div id="gm-output-wrap" class="hidden rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 overflow-hidden">
          <div class="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-extrabold text-cyan-500" id="gm-count-label">0 Aliases Generated</span>
            <div class="flex items-center gap-2">
              <button id="gm-copy-all" class="btn-gradient-emerald btn-shimmer px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-white">${T.copyAll}</button>
              <button id="gm-exp-txt" class="btn-glass px-3 py-1.5 rounded-lg text-[11px] font-bold">${T.exportTxt}</button>
              <button id="gm-exp-csv" class="btn-glass px-3 py-1.5 rounded-lg text-[11px] font-bold">${T.exportCsv}</button>
            </div>
          </div>
          <div id="gm-alias-list" class="max-h-72 overflow-y-auto divide-y divide-slate-200 dark:divide-white/10"></div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // ---- TAB SWITCHER ----
  const tabPass = container.querySelector("#pg-tab-pass");
  const tabGmail = container.querySelector("#pg-tab-gmail");
  const panelPass = container.querySelector("#pg-panel-pass");
  const panelGmail = container.querySelector("#pg-panel-gmail");

  function switchTab(isPass) {
    panelPass.classList.toggle("hidden", !isPass);
    panelGmail.classList.toggle("hidden", isPass);
    tabPass.className = isPass
      ? "btn-gradient-emerald text-white py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2"
      : "text-slate-600 dark:text-slate-300 py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2";
    tabGmail.className = !isPass
      ? "btn-aurora text-white py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2"
      : "text-slate-600 dark:text-slate-300 py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2";
  }
  tabPass.addEventListener("click", () => switchTab(true));
  tabGmail.addEventListener("click", () => switchTab(false));

  // ---- PASSWORD GENERATOR LOGIC ----
  const pwOutput = container.querySelector("#pw-output");
  const lenSlider = container.querySelector("#pw-len-slider");
  const lenVal = container.querySelector("#pw-len-val");
  const entropyEl = container.querySelector("#pw-entropy");
  const crackEl = container.querySelector("#pw-crack");
  const strengthBar = container.querySelector("#pw-strength-bar");

  function formatCrackTime(bits) {
    // Assumes fast offline GPU attack at 10^10 guesses/sec
    const secs = Math.pow(2, bits) / 1e10;
    if (secs < 1) return "Instant (Weak)";
    if (secs < 60) return `${Math.round(secs)} seconds`;
    if (secs < 3600) return `${Math.round(secs / 60)} minutes`;
    if (secs < 86400) return `${Math.round(secs / 3600)} hours`;
    if (secs < 31536000) return `${Math.round(secs / 86400)} days`;
    const years = secs / 31536000;
    if (years < 1000) return `${Math.round(years)} years`;
    if (years < 1e6) return `${Math.round(years / 1000)}K years`;
    if (years < 1e9) return `${Math.round(years / 1e6)}M years`;
    return "Billions of years (Uncrackable)";
  }

  function generatePassword() {
    const len = Number(lenSlider.value);
    lenVal.textContent = len;

    const noAmbig = container.querySelector("#pw-no-ambig").checked;
    let upper = noAmbig ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lower = noAmbig ? "abcdefghijkmnopqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    let nums = noAmbig ? "23456789" : "0123456789";
    let syms = "!@#$%^&*()-_=+[]{}|;:,.?";

    let pool = "";
    if (container.querySelector("#pw-upper").checked) pool += upper;
    if (container.querySelector("#pw-lower").checked) pool += lower;
    if (container.querySelector("#pw-num").checked) pool += nums;
    if (container.querySelector("#pw-sym").checked) pool += syms;

    if (!pool) {
      container.querySelector("#pw-lower").checked = true;
      pool = lower;
    }

    const rnd = new Uint32Array(len);
    crypto.getRandomValues(rnd);
    let pass = "";
    for (let i = 0; i < len; i++) {
      pass += pool[rnd[i] % pool.length];
    }
    pwOutput.value = pass;

    const entropy = Math.round(len * Math.log2(pool.length));
    entropyEl.textContent = `${entropy} bits`;
    crackEl.textContent = formatCrackTime(entropy);

    const pct = Math.min(100, Math.round((entropy / 128) * 100));
    strengthBar.style.width = `${pct}%`;
    strengthBar.className =
      entropy >= 80
        ? "h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
        : entropy >= 55
        ? "h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
        : "h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-300";
  }

  ["#pw-len-slider", "#pw-upper", "#pw-lower", "#pw-num", "#pw-sym", "#pw-no-ambig"].forEach((sel) => {
    container.querySelector(sel).addEventListener("input", generatePassword);
  });
  container.querySelector("#pw-gen-btn").addEventListener("click", generatePassword);
  container.querySelector("#pw-copy-btn").addEventListener("click", () => {
    navigator.clipboard?.writeText(pwOutput.value);
    const sp = container.querySelector("#pw-copy-btn span");
    sp.textContent = T.copied;
    setTimeout(() => { sp.textContent = T.copy; }, 1500);
  });
  generatePassword();

  // ---- GMAIL DOT & PLUS ALIAS LOGIC ----
  let generatedAliases = [];
  const gmInput = container.querySelector("#gm-email-input");
  const gmTagInput = container.querySelector("#gm-tag-input");
  const gmWrap = container.querySelector("#gm-output-wrap");
  const gmCount = container.querySelector("#gm-count-label");
  const gmList = container.querySelector("#gm-alias-list");

  function generateGmailAliases() {
    const raw = gmInput.value.trim().toLowerCase();
    if (!raw || !raw.includes("@")) {
      alert(isBn ? "সঠিক জিমেইল ঠিকানা লিখুন (যেমন name@gmail.com)" : "Enter a valid Gmail address (e.g. name@gmail.com)");
      return;
    }

    const [rawUser, rawDomain] = raw.split("@");
    const cleanUser = rawUser.split("+")[0].replace(/\./g, "");
    const domain = rawDomain === "googlemail.com" ? "googlemail.com" : "gmail.com";

    if (cleanUser.length < 2) return;

    const aliasSet = new Set();

    // 1. Custom +Tag & Smart Tracking Tags
    const customTag = gmTagInput.value.trim().replace(/[^a-z0-9_-]/gi, "");
    if (customTag) aliasSet.add(`${cleanUser}+${customTag}@${domain}`);

    const smartTags = ["shopping", "trials", "social", "newsletter", "gaming", "promo", "work", "finance"];
    smartTags.forEach((tag) => aliasSet.add(`${cleanUser}+${tag}@${domain}`));

    // 2. Dot Variations (Bitmask trick, capped safely at 48 unique variants)
    const slots = Math.min(cleanUser.length - 1, 14);
    const maxComb = Math.min(1 << slots, 48);
    for (let mask = 1; mask < maxComb; mask++) {
      let dotted = "";
      for (let i = 0; i < cleanUser.length; i++) {
        dotted += cleanUser[i];
        if (i < slots && (mask & (1 << i))) dotted += ".";
      }
      aliasSet.add(`${dotted}@${domain}`);
    }

    generatedAliases = Array.from(aliasSet);
    gmCount.textContent = `${generatedAliases.length} Unique Aliases Ready`;
    gmWrap.classList.remove("hidden");

    gmList.innerHTML = generatedAliases
      .map(
        (email) => `
        <div class="px-5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-100/70 dark:hover:bg-white/5">
          <span class="font-mono text-xs sm:text-sm font-semibold truncate">${email}</span>
          <button data-copy-email="${email}" class="gm-copy-one btn-glass px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0">${T.copy}</button>
        </div>`
      )
      .join("");

    gmList.querySelectorAll(".gm-copy-one").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.clipboard?.writeText(btn.getAttribute("data-copy-email"));
        btn.textContent = T.copied;
        setTimeout(() => { btn.textContent = T.copy; }, 1400);
      });
    });
  }

  function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  container.querySelector("#gm-gen-btn").addEventListener("click", generateGmailAliases);
  container.querySelector("#gm-copy-all").addEventListener("click", () => {
    if (!generatedAliases.length) return;
    navigator.clipboard?.writeText(generatedAliases.join("\n"));
    const b = container.querySelector("#gm-copy-all");
    b.textContent = T.copied;
    setTimeout(() => { b.textContent = T.copyAll; }, 1500);
  });
  container.querySelector("#gm-exp-txt").addEventListener("click", () => {
    if (generatedAliases.length) downloadFile(generatedAliases.join("\n"), "checkkit-gmail-aliases.txt", "text/plain");
  });
  container.querySelector("#gm-exp-csv").addEventListener("click", () => {
    if (generatedAliases.length) {
      const csv = "Alias Email\n" + generatedAliases.join("\n");
      downloadFile(csv, "checkkit-gmail-aliases.csv", "text/csv");
    }
  });
};