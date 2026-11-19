window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["temp-mail"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    yourEmail: isBn ? "আপনার অস্থায়ী ইমেইল ঠিকানা" : "Your Temporary Email Address",
    copyBtn: isBn ? "কপি করুন" : "Copy",
    copied: isBn ? "কপি হয়েছে!" : "Copied!",
    refreshBtn: isBn ? "রিফ্রেশ" : "Refresh",
    newBtn: isBn ? "নতুন ইমেইল" : "New Address",
    inboxTitle: isBn ? "ইনবক্স (স্বয়ংক্রিয় রিফ্রেশ)" : "Live Inbox (Auto-Refresh)",
    waitingMsg: isBn
      ? "নতুন ইমেইলের অপেক্ষায়... যেকোনো সাইটে সাইনআপ করতে উপরের ইমেইলটি ব্যবহার করুন।"
      : "Waiting for incoming emails... Use the address above for instant OTPs & signups.",
    creating: isBn ? "নতুন নিরাপদ ইনবক্স তৈরি হচ্ছে..." : "Generating fresh anonymous inbox...",
    autoIn: isBn ? "পরবর্তী রিফ্রেশ:" : "Next check in:",
    backInbox: isBn ? "ইনবক্সে ফিরুন" : "Back to Inbox",
    errApi: isBn
      ? "mail.tm সার্ভার ব্যস্ত আছে। কয়েক সেকেন্ড পর 'নতুন ইমেইল' বাটনে ক্লিক করুন।"
      : "mail.tm API rate-limited or busy. Wait a few seconds and click New Address."
  };

  const API_BASE = "https://api.mail.tm";
  const STORAGE_KEY = "ck_tempmail_session_v1";

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Active Temp Email Hero Box -->
      <div class="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-[#151136] to-slate-900 border border-fuchsia-500/30 text-white space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span id="tm-status-badge">LIVE MAIL.TM INBOX</span>
          </span>
          <span class="text-[11px] font-mono text-slate-400">${T.autoIn} <strong id="tm-countdown" class="text-cyan-400">10s</strong></span>
        </div>

        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">${T.yourEmail}</div>

        <!-- Copyable Address Bar -->
        <div class="flex flex-col sm:flex-row gap-2.5">
          <div class="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/15 font-mono text-sm sm:text-base font-extrabold text-cyan-300 truncate flex items-center justify-between gap-2">
            <span id="tm-address" class="truncate">${T.creating}</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button id="tm-copy-btn" class="btn-gradient-emerald btn-shimmer flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-extrabold text-white inline-flex items-center justify-center gap-1.5">
              <i data-lucide="copy" class="w-4 h-4"></i> <span>${T.copyBtn}</span>
            </button>
            <button id="tm-refresh-btn" class="btn-glass px-3.5 py-3 rounded-xl text-xs font-bold text-white inline-flex items-center justify-center gap-1.5" title="${T.refreshBtn}">
              <i data-lucide="refresh-cw" class="w-4 h-4 text-cyan-400"></i>
            </button>
            <button id="tm-new-btn" class="btn-aurora btn-shimmer px-4 py-3 rounded-xl text-xs font-extrabold text-white inline-flex items-center justify-center gap-1.5">
              <i data-lucide="shuffle" class="w-4 h-4"></i> <span>${T.newBtn}</span>
            </button>
          </div>
        </div>

        <div id="tm-error-box" class="hidden p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300"></div>
      </div>

      <!-- Inbox List View -->
      <div id="tm-inbox-panel" class="rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h4 class="text-xs sm:text-sm font-extrabold flex items-center gap-2">
            <i data-lucide="inbox" class="w-4 h-4 text-fuchsia-400"></i>
            <span>${T.inboxTitle}</span>
          </h4>
          <span id="tm-count-pill" class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/15 text-cyan-500">0 Messages</span>
        </div>

        <div id="tm-msg-list" class="divide-y divide-slate-200 dark:divide-white/10 min-h-[190px]">
          <div class="p-10 text-center space-y-2">
            <i data-lucide="mail-open" class="w-9 h-9 text-slate-400 mx-auto opacity-70"></i>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">${T.waitingMsg}</p>
          </div>
        </div>
      </div>

      <!-- Email Reader Panel (Opens when clicking a message) -->
      <div id="tm-reader-panel" class="hidden rounded-2xl bg-white dark:bg-white/[0.03] border border-cyan-500/30 overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          <button id="tm-back-btn" class="btn-glass px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> ${T.backInbox}
          </button>
          <span id="tm-read-date" class="text-[11px] font-mono text-slate-400"></span>
        </div>
        <div class="p-5 space-y-3">
          <h3 id="tm-read-subject" class="text-base sm:text-lg font-extrabold"></h3>
          <div class="text-xs text-slate-500 dark:text-slate-400">
            From: <strong id="tm-read-from" class="text-cyan-500 font-mono"></strong>
          </div>
          <!-- Sandboxed iframe prevents malicious scripts inside spam emails -->
          <iframe id="tm-read-frame" sandbox="" class="w-full min-h-[280px] rounded-xl bg-white border border-slate-200 dark:border-white/10"></iframe>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const addrEl = container.querySelector("#tm-address");
  const errBox = container.querySelector("#tm-error-box");
  const countdownEl = container.querySelector("#tm-countdown");
  const countPill = container.querySelector("#tm-count-pill");
  const msgListEl = container.querySelector("#tm-msg-list");
  const inboxPanel = container.querySelector("#tm-inbox-panel");
  const readerPanel = container.querySelector("#tm-reader-panel");

  let session = null;
  let timerId = null;
  let secLeft = 10;

  function randomStr(len) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) res += chars[arr[i] % chars.length];
    return res;
  }

  function showErr(msg) {
    errBox.textContent = msg;
    errBox.classList.remove("hidden");
  }
  function hideErr() {
    errBox.classList.add("hidden");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function createNewInbox() {
    hideErr();
    addrEl.textContent = T.creating;
    inboxPanel.classList.remove("hidden");
    readerPanel.classList.add("hidden");

    try {
      const domRes = await fetch(`${API_BASE}/domains`);
      if (!domRes.ok) throw new Error("Domain fetch failed");
      const domJson = await domRes.json();
      const domains = domJson["hydra:member"] || [];
      if (!domains.length) throw new Error("No active domain");

      const domain = domains[0].domain;
      const address = `ck.${randomStr(7)}@${domain}`;
      const password = `Ck!${randomStr(12)}`;

      const accRes = await fetch(`${API_BASE}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });
      if (!accRes.ok) throw new Error("Account creation failed");
      const accData = await accRes.json();

      const tokRes = await fetch(`${API_BASE}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });
      if (!tokRes.ok) throw new Error("Token fetch failed");
      const tokData = await tokRes.json();

      session = { id: accData.id, address, token: tokData.token };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      addrEl.textContent = session.address;
      await fetchMessages();
    } catch (err) {
      addrEl.textContent = "Service Busy — Retry";
      showErr(T.errApi);
    }
  }

  async function fetchMessages() {
    if (!session || !session.token || !container.isConnected) return;
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem(STORAGE_KEY);
        await createNewInbox();
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      const msgs = data["hydra:member"] || [];
      countPill.textContent = `${msgs.length} ${msgs.length === 1 ? "Message" : "Messages"}`;

      if (!msgs.length) {
        msgListEl.innerHTML = `
          <div class="p-10 text-center space-y-2">
            <i data-lucide="mail-open" class="w-9 h-9 text-slate-400 mx-auto opacity-70"></i>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">${T.waitingMsg}</p>
          </div>`;
        if (window.lucide) lucide.createIcons();
        return;
      }

      msgListEl.innerHTML = msgs
        .map((m) => {
          const from = (m.from && (m.from.name || m.from.address)) || "Unknown Sender";
          const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
          return `
            <button data-msg-id="${m.id}" class="tm-open-msg w-full text-left px-5 py-3.5 hover:bg-slate-100/80 dark:hover:bg-white/5 transition flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 truncate">${escapeHtml(from)}</div>
                <div class="text-sm font-bold truncate mt-0.5">${escapeHtml(m.subject || "(No Subject)")}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${escapeHtml(m.intro || "")}</div>
              </div>
              <span class="text-[10px] font-mono text-slate-400 shrink-0">${time}</span>
            </button>`;
        })
        .join("");

      msgListEl.querySelectorAll(".tm-open-msg").forEach((btn) => {
        btn.addEventListener("click", () => openMessage(btn.getAttribute("data-msg-id")));
      });
    } catch (e) {}
  }

  async function openMessage(msgId) {
    if (!session || !session.token) return;
    try {
      const res = await fetch(`${API_BASE}/messages/${msgId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      if (!res.ok) return;
      const m = await res.json();

      container.querySelector("#tm-read-subject").textContent = m.subject || "(No Subject)";
      container.querySelector("#tm-read-from").textContent =
        m.from ? `${m.from.name || ""} <${m.from.address || ""}>` : "Unknown";
      container.querySelector("#tm-read-date").textContent = m.createdAt ? new Date(m.createdAt).toLocaleString() : "";

      const frame = container.querySelector("#tm-read-frame");
      const htmlBody = Array.isArray(m.html) && m.html.length ? m.html.join("") : null;
      const safeContent = htmlBody
        ? htmlBody
        : `<pre style="font-family:sans-serif;white-space:pre-wrap;padding:14px;color:#0f172a;font-size:13px;">${escapeHtml(m.text || "Empty message body.")}</pre>`;
      frame.srcdoc = safeContent;

      inboxPanel.classList.add("hidden");
      readerPanel.classList.remove("hidden");
    } catch (e) {}
  }

  function startAutoRefresh() {
    clearInterval(timerId);
    secLeft = 10;
    timerId = setInterval(() => {
      if (!container.isConnected) {
        clearInterval(timerId);
        return;
      }
      secLeft--;
      if (secLeft <= 0) {
        secLeft = 10;
        fetchMessages();
      }
      countdownEl.textContent = `${secLeft}s`;
    }, 1000);
  }

  // Controls
  container.querySelector("#tm-copy-btn").addEventListener("click", () => {
    if (!session || !session.address) return;
    navigator.clipboard?.writeText(session.address);
    const sp = container.querySelector("#tm-copy-btn span");
    sp.textContent = T.copied;
    setTimeout(() => { sp.textContent = T.copyBtn; }, 1600);
  });

  container.querySelector("#tm-refresh-btn").addEventListener("click", () => {
    secLeft = 10;
    countdownEl.textContent = "10s";
    fetchMessages();
  });

  container.querySelector("#tm-new-btn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    createNewInbox();
  });

  container.querySelector("#tm-back-btn").addEventListener("click", () => {
    readerPanel.classList.add("hidden");
    inboxPanel.classList.remove("hidden");
  });

  // Restore saved inbox or create a new one
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      session = JSON.parse(saved);
      addrEl.textContent = session.address;
      fetchMessages();
    } catch (e) {
      createNewInbox();
    }
  } else {
    createNewInbox();
  }
  startAutoRefresh();

  // Auto-Cleanup
  window.addEventListener("hashchange", function cleanup() {
    clearInterval(timerId);
    window.removeEventListener("hashchange", cleanup);
  });
};