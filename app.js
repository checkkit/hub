// ============================================================================
// PLUG-AND-PLAY TOOL REGISTRY (প্রতিটি টুল পরবর্তীতে এখানে যুক্ত হবে)
// ============================================================================
window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

(function () {
  const CFG = window.APP_CONFIG;

  const state = {
    lang: localStorage.getItem("ck_lang") || CFG.defaultLang,
    theme: localStorage.getItem("ck_theme") || "dark",
    category: "all",
    search: "",
    activeToolId: null,
    authMode: "login", // "login" | "register"
    user: JSON.parse(localStorage.getItem("ck_user") || "null"),
    scorecard: JSON.parse(localStorage.getItem("ck_scorecard") || "{}")
  };

  const el = {
    brandLogoImg: document.getElementById("brand-logo-img"),
    brandName: document.getElementById("brand-name"),
    footerBrand: document.getElementById("footer-brand"),
    homeView: document.getElementById("home-view"),
    toolView: document.getElementById("tool-view"),
    toolsGrid: document.getElementById("tools-grid"),
    emptySearch: document.getElementById("empty-search"),
    globalSearch: document.getElementById("global-search"),
    mobileSearch: document.getElementById("mobile-search"),
    langToggle: document.getElementById("lang-toggle"),
    themeToggle: document.getElementById("theme-toggle"),
    scorecardBadge: document.getElementById("scorecard-badge"),
    navAuthLabel: document.getElementById("nav-auth-label"),
    mobileAuthLabel: document.getElementById("mobile-auth-label"),
    // Modals
    authModal: document.getElementById("auth-modal"),
    proModal: document.getElementById("pro-modal"),
    scorecardModal: document.getElementById("scorecard-modal"),
    scorecardList: document.getElementById("scorecard-list"),
    // Auth UI
    authModalHeading: document.getElementById("auth-modal-heading"),
    authFormsWrap: document.getElementById("auth-forms-wrap"),
    authProfileWrap: document.getElementById("auth-profile-wrap"),
    tabLoginBtn: document.getElementById("tab-login-btn"),
    tabRegisterBtn: document.getElementById("tab-register-btn"),
    authNameField: document.getElementById("auth-name-field"),
    authForm: document.getElementById("auth-form"),
    authSubmitBtn: document.getElementById("auth-submit-btn"),
    authFeedback: document.getElementById("auth-feedback"),
    // Workspace
    wsCategoryLabel: document.getElementById("ws-category-label"),
    wsBreadcrumbTitle: document.getElementById("ws-breadcrumb-title"),
    wsIconBox: document.getElementById("ws-icon-box"),
    wsTitle: document.getElementById("ws-title"),
    wsDesc: document.getElementById("ws-desc"),
    toolMount: document.getElementById("tool-mount"),
    wsScorecardBar: document.getElementById("ws-scorecard-bar"),
    wsSeoGuide: document.getElementById("ws-seo-guide"),
    wsFaqList: document.getElementById("ws-faq-list"),
    wsRelatedTools: document.getElementById("ws-related-tools"),
    smartAffiliateCard: document.getElementById("smart-affiliate-card"),
  };

  // ---------------- SHA-256 HASHING (পাসওয়ার্ড কখনো প্লেইন-টেক্সটে যাবে না) ----------------
  async function hashPassword(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // ---------------- FREE GOOGLE SHEETS AUTH ENGINE ----------------
  async function callSheetBackend(payload) {
    const url = CFG.backend.googleSheetAuthUrl;

    // Google Sheet URL এখনো না বসালে Demo LocalStorage মোডে কাজ করবে
    if (!url) {
      const db = JSON.parse(localStorage.getItem("ck_demo_users") || "[]");
      if (payload.action === "register") {
        if (db.some((u) => u.email === payload.email)) {
          return { ok: false, message: "This email is already registered." };
        }
        const newUser = { name: payload.name, email: payload.email, passwordHash: payload.passwordHash, plan: "FREE" };
        db.push(newUser);
        localStorage.setItem("ck_demo_users", JSON.stringify(db));
        return { ok: true, user: { name: newUser.name, email: newUser.email, plan: newUser.plan }, message: "Account created (Local Preview Mode)!" };
      }
      if (payload.action === "login") {
        const found = db.find((u) => u.email === payload.email && u.passwordHash === payload.passwordHash);
        if (!found) return { ok: false, message: "Invalid email or password." };
        return { ok: true, user: { name: found.name, email: found.email, plan: found.plan } };
      }
      if (payload.action === "pro_request") {
        return { ok: true, message: "TrxID recorded (Demo Mode). Connect Google Sheet URL in config.js for live saving." };
      }
    }

    // Live Google Apps Script Web App Call
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  }

  function syncUserUI() {
    const isPro = state.user && state.user.plan === "PRO";
    // Pro ইউজার হলে সব বিজ্ঞাপন অটোমেটিক হাইড হয়ে যাবে!
    document.querySelectorAll(".ad-slot-box").forEach((box) => {
      box.classList.toggle("hidden", Boolean(isPro));
    });

    if (state.user) {
      el.navAuthLabel.textContent = state.user.name.split(" ")[0];
      el.mobileAuthLabel.textContent = state.user.name.split(" ")[0];
      el.authFormsWrap.classList.add("hidden");
      el.authProfileWrap.classList.remove("hidden");
      el.authModalHeading.textContent = "Your Account";
      document.getElementById("profile-name").textContent = state.user.name;
      document.getElementById("profile-email").textContent = state.user.email;
      const badge = document.getElementById("profile-plan-badge");
      badge.textContent = isPro ? "PRO ACTIVE" : "FREE PLAN";
      badge.className = isPro
        ? "px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-fuchsia-500 to-amber-500 text-white"
        : "px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-400/30";
    } else {
      el.navAuthLabel.textContent = t("signIn");
      el.mobileAuthLabel.textContent = "Account";
      el.authFormsWrap.classList.remove("hidden");
      el.authProfileWrap.classList.add("hidden");
      el.authModalHeading.textContent = state.authMode === "login" ? "Welcome Back" : "Create Free Account";
    }
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    el.tabLoginBtn.classList.toggle("active", mode === "login");
    el.tabRegisterBtn.classList.toggle("active", mode === "register");
    el.authNameField.classList.toggle("hidden", mode === "login");
    document.getElementById("auth-name").required = mode === "register";
    el.authSubmitBtn.textContent = mode === "login" ? `Sign In to ${CFG.brandName}` : "Create Free Account";
    el.authModalHeading.textContent = mode === "login" ? "Welcome Back" : "Create Free Account";
    el.authFeedback.classList.add("hidden");
  }

  // ---------------- THEME & LANGUAGE ----------------
  function applyTheme() {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    localStorage.setItem("ck_theme", state.theme);
  }

  function t(key) {
    return (CFG.i18n[state.lang] && CFG.i18n[state.lang][key]) || key;
  }

  function applyLanguage() {
    localStorage.setItem("ck_lang", state.lang);
    document.documentElement.lang = state.lang;
    el.langToggle.textContent = state.lang === "en" ? "বাংলা" : "English";

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.getAttribute("data-i18n"));
    });

    el.globalSearch.placeholder = t("searchPlaceholder");
    el.mobileSearch.placeholder = t("searchPlaceholder");
    syncUserUI();
    renderToolsGrid();
    if (state.activeToolId) renderWorkspace(state.activeToolId);
  }

  // ---------------- SCORECARD ----------------
  function updateScorecardBadge() {
    const hwTools = CFG.tools.filter((x) => x.scorecard);
    const testedCount = hwTools.filter((x) => state.scorecard[x.id]).length;
    el.scorecardBadge.textContent = `${testedCount}/${hwTools.length}`;
  }

  function setScorecardResult(toolId, status) {
    state.scorecard[toolId] = status;
    localStorage.setItem("ck_scorecard", JSON.stringify(state.scorecard));
    updateScorecardBadge();
  }

  function renderScorecardModal() {
    const hwTools = CFG.tools.filter((x) => x.scorecard);
    el.scorecardList.innerHTML = hwTools
      .map((tool) => {
        const res = state.scorecard[tool.id];
        let pill = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-white/10 text-slate-500">Pending</span>`;
        if (res === "pass") pill = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400">✓ Passed</span>`;
        if (res === "fail") pill = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400">✕ Issue</span>`;
        return `
          <a href="#${tool.id}" class="scorecard-link flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-400 transition">
            <span class="text-xs font-bold">${tool.name[state.lang]}</span>
            ${pill}
          </a>`;
      })
      .join("");
    el.scorecardList.querySelectorAll(".scorecard-link").forEach((a) => a.addEventListener("click", closeModals));
  }

  // ---------------- RENDER TOOLS BENTO GRID ----------------
  function renderToolsGrid() {
    const q = state.search.trim().toLowerCase();
    const filtered = CFG.tools.filter((tool) => {
      const catMatch = state.category === "all" || tool.category === state.category;
      const textMatch =
        !q ||
        tool.name.en.toLowerCase().includes(q) ||
        tool.name.bn.toLowerCase().includes(q) ||
        tool.desc.en.toLowerCase().includes(q) ||
        tool.desc.bn.toLowerCase().includes(q);
      return catMatch && textMatch;
    });

    el.emptySearch.classList.toggle("hidden", filtered.length > 0);

    const catStyles = {
      hardware: {
        iconBg: "from-emerald-400 to-teal-600 shadow-emerald-500/30",
        btn: "btn-gradient-emerald",
        badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/25"
      },
      privacy: {
        iconBg: "from-cyan-400 to-blue-600 shadow-cyan-500/30",
        btn: "btn-gradient-cyber",
        badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/25"
      },
      security: {
        iconBg: "from-violet-500 to-fuchsia-600 shadow-fuchsia-500/30",
        btn: "btn-aurora",
        badge: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/25"
      }
    };

    el.toolsGrid.innerHTML = filtered
      .map((tool) => {
        const st = catStyles[tool.category];
        const isBuilt = Boolean(window.TOOL_HANDLERS[tool.id]);
        return `
          <div class="tool-card cat-${tool.category} glass-card rounded-3xl p-5 flex flex-col justify-between group">
            <div>
              <div class="flex items-start justify-between gap-3 mb-4">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${st.iconBg} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <i data-lucide="${tool.icon}" class="w-6 h-6"></i>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${st.badge}">${tool.badge}</span>
                  <span class="w-2 h-2 rounded-full ${isBuilt ? "bg-emerald-400" : "bg-amber-400"}" title="${isBuilt ? "Live" : "Slot Ready"}"></span>
                </div>
              </div>
              <h2 class="font-extrabold text-base sm:text-lg mb-1.5 group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition">
                ${tool.name[state.lang]}
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                ${tool.desc[state.lang]}
              </p>
            </div>

            <a href="#${tool.id}" class="${st.btn} btn-shimmer inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-white shadow-md">
              <span>${t("openTool")}</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"></i>
            </a>
          </div>
        `;
      })
      .join("");

    lucide.createIcons();
  }

  // ---------------- RENDER TOOL WORKSPACE ----------------
  function renderWorkspace(toolId) {
    const tool = CFG.tools.find((item) => item.id === toolId);
    if (!tool) {
      navigateHome();
      return;
    }

    state.activeToolId = toolId;
    el.homeView.classList.add("hidden");
    el.toolView.classList.remove("hidden");
    document.title = `${tool.name[state.lang]} — ${CFG.brandName}`;

    const catNames = { hardware: t("catHardware"), privacy: t("catPrivacy"), security: t("catSecurity") };
    el.wsCategoryLabel.textContent = catNames[tool.category];
    el.wsBreadcrumbTitle.textContent = tool.name[state.lang];
    el.wsTitle.textContent = tool.name[state.lang];
    el.wsDesc.textContent = tool.desc[state.lang];
    el.wsIconBox.innerHTML = `<i data-lucide="${tool.icon}" class="w-6 h-6"></i>`;
    el.wsScorecardBar.classList.toggle("hidden", !tool.scorecard);

    el.toolMount.innerHTML = "";
    if (typeof window.TOOL_HANDLERS[tool.id] === "function") {
      window.TOOL_HANDLERS[tool.id](el.toolMount, {
        lang: state.lang,
        config: CFG,
        user: state.user,
        markResult: (status) => setScorecardResult(tool.id, status),
      });
    } else {
      el.toolMount.innerHTML = `
        <div class="text-center py-10 px-4">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-cyan-500/25">
            <i data-lucide="${tool.icon}" class="w-8 h-8"></i>
          </div>
          <span class="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-400/30 mb-3">
            PLUG-AND-PLAY SLOT READY
          </span>
          <h3 class="text-lg font-extrabold mb-1.5">${tool.name[state.lang]}</h3>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            এই টুলটির SaaS ডিজাইন সম্পূর্ণ প্রস্তুত। পরের ধাপে <code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-cyan-400">tools/${tool.id}.js</code> যোগ করলেই এখানে লাইভ চলবে।
          </p>
        </div>
      `;
    }

    // Smart Context-Aware Affiliate Card
    const aff = CFG.affiliates[tool.category] || CFG.affiliates.privacy;
    el.smartAffiliateCard.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">${aff.badge}</span>
        <i data-lucide="${aff.icon}" class="w-5 h-5 text-cyan-300"></i>
      </div>
      <h3 class="font-extrabold text-lg leading-snug mb-2">${aff.title[state.lang]}</h3>
      <p class="text-xs text-slate-300 leading-relaxed mb-5">${aff.desc[state.lang]}</p>
      <a href="${aff.url}" target="_blank" rel="sponsored noopener" class="btn-aurora btn-shimmer block text-center w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white shadow-lg">
        ${aff.cta[state.lang]}
      </a>
    `;

    // SEO Guide & FAQs
    el.wsSeoGuide.textContent = tool.guide[state.lang];
    el.wsFaqList.innerHTML = (tool.faqs || [])
      .map(
        (item) => `
        <details class="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03] p-4">
          <summary class="flex items-center justify-between cursor-pointer text-xs sm:text-sm font-bold list-none">
            <span>${item.q}</span>
            <i data-lucide="chevron-down" class="faq-chevron w-4 h-4 text-cyan-400 transition-transform"></i>
          </summary>
          <p class="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">${item.a}</p>
        </details>`
      )
      .join("");

    // Related Tools
    el.wsRelatedTools.innerHTML = CFG.tools
      .filter((x) => x.id !== tool.id)
      .slice(0, 5)
      .map(
        (r) => `
        <a href="#${r.id}" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition">
          <i data-lucide="${r.icon}" class="w-4 h-4 text-cyan-400 shrink-0"></i>
          <span class="text-xs font-bold truncate">${r.name[state.lang]}</span>
        </a>`
      )
      .join("");

    window.scrollTo({ top: 0, behavior: "smooth" });
    lucide.createIcons();
  }

  function navigateHome() {
    state.activeToolId = null;
    el.toolView.classList.add("hidden");
    el.homeView.classList.remove("hidden");
    document.title = `${CFG.brandName} — International Hardware, Privacy & Anti-Scam SaaS Toolkit`;
    lucide.createIcons();
  }

  function handleRoute() {
    const hash = window.location.hash.replace("#", "").trim();
    if (!hash || hash === "home") navigateHome();
    else renderWorkspace(hash);
  }

  // ---------------- MODALS ----------------
  function openModal(modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
  function closeModals() {
    [el.authModal, el.proModal, el.scorecardModal].forEach((m) => {
      m.classList.add("hidden");
      m.classList.remove("flex");
    });
  }

  // ---------------- EVENTS ----------------
  el.themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
  });

  el.langToggle.addEventListener("click", () => {
    state.lang = state.lang === "en" ? "bn" : "en";
    applyLanguage();
  });

  // Keyboard Shortcut Ctrl+K / Cmd+K for Search
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      el.globalSearch.focus();
    }
  });

  function selectCategory(cat) {
    state.category = cat;
    document.querySelectorAll(".cat-tab").forEach((b) => b.classList.toggle("active", b.getAttribute("data-cat") === cat));
    document.querySelectorAll("[data-mobile-nav]").forEach((b) => b.classList.toggle("active", b.getAttribute("data-mobile-nav") === cat));
    if (state.activeToolId) window.location.hash = "#home";
    renderToolsGrid();
  }

  document.querySelectorAll(".cat-tab").forEach((btn) => btn.addEventListener("click", () => selectCategory(btn.getAttribute("data-cat"))));
  document.querySelectorAll("[data-mobile-nav]").forEach((btn) => btn.addEventListener("click", () => selectCategory(btn.getAttribute("data-mobile-nav"))));

  function onSearchInput(val) {
    state.search = val;
    if (state.activeToolId) window.location.hash = "#home";
    renderToolsGrid();
  }
  el.globalSearch.addEventListener("input", (e) => { el.mobileSearch.value = e.target.value; onSearchInput(e.target.value); });
  el.mobileSearch.addEventListener("input", (e) => { el.globalSearch.value = e.target.value; onSearchInput(e.target.value); });

  // Open Modals
  document.getElementById("open-auth-btn").addEventListener("click", () => { syncUserUI(); openModal(el.authModal); });
  document.getElementById("mobile-auth-btn").addEventListener("click", () => { syncUserUI(); openModal(el.authModal); });
  document.getElementById("open-pro-btn").addEventListener("click", () => openModal(el.proModal));
  document.getElementById("profile-upgrade-btn").addEventListener("click", () => { closeModals(); openModal(el.proModal); });
  document.getElementById("open-scorecard-btn").addEventListener("click", () => { renderScorecardModal(); openModal(el.scorecardModal); });
  document.getElementById("mobile-scorecard-btn").addEventListener("click", () => { renderScorecardModal(); openModal(el.scorecardModal); });
  document.querySelectorAll(".close-modal").forEach((b) => b.addEventListener("click", closeModals));

  // Auth Tabs & Form Submit
  el.tabLoginBtn.addEventListener("click", () => setAuthMode("login"));
  el.tabRegisterBtn.addEventListener("click", () => setAuthMode("register"));

  el.authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("auth-name").value.trim();
    const email = document.getElementById("auth-email").value.trim().toLowerCase();
    const password = document.getElementById("auth-password").value;

    el.authSubmitBtn.disabled = true;
    el.authSubmitBtn.textContent = "Processing...";
    el.authFeedback.classList.add("hidden");

    try {
      const passwordHash = await hashPassword(password);
      const res = await callSheetBackend({ action: state.authMode, name, email, passwordHash });
      if (res.ok) {
        state.user = res.user;
        localStorage.setItem("ck_user", JSON.stringify(res.user));
        syncUserUI();
        el.authForm.reset();
      } else {
        el.authFeedback.textContent = res.message || "Authentication failed.";
        el.authFeedback.className = "text-xs font-bold px-3.5 py-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30";
      }
    } catch (err) {
      el.authFeedback.textContent = "Network error. Please try again.";
      el.authFeedback.className = "text-xs font-bold px-3.5 py-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30";
    } finally {
      el.authSubmitBtn.disabled = false;
      setAuthMode(state.authMode);
    }
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    state.user = null;
    localStorage.removeItem("ck_user");
    syncUserUI();
    closeModals();
  });

  // bKash Manual TrxID Form -> Google Sheet
  document.getElementById("toggle-bkash-form").addEventListener("click", () => {
    document.getElementById("bkash-verify-form").classList.toggle("hidden");
  });

  document.getElementById("bkash-verify-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const trxId = document.getElementById("bkash-trxid").value.trim();
    const fb = document.getElementById("bkash-feedback");
    const email = state.user ? state.user.email : "guest@visitor";
    const res = await callSheetBackend({ action: "pro_request", email, trxId });
    fb.textContent = res.message || "Submitted! Your Pro plan will activate shortly.";
    fb.classList.remove("hidden");
    e.target.reset();
  });

  // Scorecard Actions
  document.getElementById("mark-pass-btn").addEventListener("click", () => state.activeToolId && setScorecardResult(state.activeToolId, "pass"));
  document.getElementById("mark-fail-btn").addEventListener("click", () => state.activeToolId && setScorecardResult(state.activeToolId, "fail"));
  document.getElementById("reset-scorecard-btn").addEventListener("click", () => {
    state.scorecard = {};
    localStorage.removeItem("ck_scorecard");
    updateScorecardBadge();
    renderScorecardModal();
  });

  window.addEventListener("hashchange", handleRoute);

  // ---------------- INIT ----------------
  el.brandLogoImg.src = CFG.logoPath;
  el.brandName.textContent = CFG.brandName;
  el.footerBrand.textContent = CFG.brandName;
  document.getElementById("pro-global-pay-link").href = CFG.payments.globalCheckoutUrl;
  document.getElementById("bkash-number-display").textContent = CFG.payments.bkashNumber;

  applyTheme();
  updateScorecardBadge();
  applyLanguage();
  handleRoute();
})();