(function () {
  function isProUser() {
    try {
      const user = JSON.parse(localStorage.getItem("ck_user") || "null");
      return Boolean(user && user.plan === "PRO");
    } catch (_) {
      return false;
    }
  }

  function createGateOverlay() {
    let gate = document.getElementById("ck-offline-gate");
    if (gate) return gate;

    const lang = localStorage.getItem("ck_lang") || "en";
    const isBn = lang === "bn";

    gate = document.createElement("div");
    gate.id = "ck-offline-gate";
    gate.className =
      "fixed inset-0 z-[9990] hidden items-center justify-center bg-[#050816]/90 backdrop-blur-xl p-5 text-white";

    gate.innerHTML = `
      <div class="max-w-md w-full rounded-3xl p-7 bg-slate-900/95 border border-cyan-500/35 shadow-2xl text-center space-y-4">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
          <i data-lucide="wifi-off" class="w-8 h-8 text-white"></i>
        </div>

        <span class="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
          ${isBn ? "অফলাইন মোড লক করা আছে" : "OFFLINE MODE LOCKED"}
        </span>

        <h3 class="text-xl font-extrabold">
          ${isBn ? "ইন্টারনেট সংযোগ প্রয়োজন" : "Internet Connection Required"}
        </h3>

        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
          ${
            isBn
              ? "ফ্রি ভার্সনে টুলগুলো ব্যবহার করতে সক্রিয় ইন্টারনেট সংযোগ চালু রাখুন। ইন্টারনেট ছাড়া অফলাইনে ব্যবহার করতে CheckKit Pro আনলক করুন।"
              : "An active internet connection is required for the Free tier. Upgrade to CheckKit Pro to unlock 100% offline access anytime."
          }
        </p>

        <div class="pt-2 space-y-2.5">
          <button id="ck-retry-net-btn" class="btn-gradient-emerald btn-shimmer w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-extrabold text-white">
            ${isBn ? "ইন্টারনেট চেক করে আবার চেষ্টা করুন" : "Retry Connection"}
          </button>
          <p class="text-[11px] text-slate-400">
            ${
              isBn
                ? "আপনি যদি Pro মেম্বার হন, তবে একবার অনলাইনে লগইন করলেই অফলাইন মোড আনলক হয়ে যাবে।"
                : "Already a Pro member? Sign in once while online to unlock offline mode."
            }
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(gate);
    if (window.lucide) lucide.createIcons();

    gate.querySelector("#ck-retry-net-btn").addEventListener("click", () => {
      updateOnlineGate();
    });

    return gate;
  }

  function updateOnlineGate() {
    const gate = createGateOverlay();
    const shouldBlock = !navigator.onLine && !isProUser();
    gate.classList.toggle("hidden", !shouldBlock);
    gate.classList.toggle("flex", shouldBlock);
  }

  window.addEventListener("online", updateOnlineGate);
  window.addEventListener("offline", updateOnlineGate);
  window.addEventListener("storage", updateOnlineGate);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateOnlineGate);
  } else {
    updateOnlineGate();
  }
})();