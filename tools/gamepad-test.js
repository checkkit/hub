window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["gamepad-test"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    waitingTitle: isBn ? "কন্ট্রোলার কানেক্ট করে যেকোনো বাটন চাপুন" : "Connect Controller & Press Any Button",
    waitingDesc: isBn
      ? "PS5, PS4, Xbox অথবা USB/Bluetooth গেমপ্যাড যুক্ত করে যেকোনো বাটন চাপলেই লাইভ টেস্ট চালু হবে।"
      : "Plug in or pair your Xbox, PlayStation, or USB/Bluetooth gamepad and press any button to wake it.",
    connected: isBn ? "কানেক্টেড" : "Connected",
    vibrateBtn: isBn ? "ভাইব্রেশন টেস্ট করুন" : "Test Vibration",
    leftStick: isBn ? "বাম জয়স্টিক (L)" : "Left Analog Stick",
    rightStick: isBn ? "ডান জয়স্টিক (R)" : "Right Analog Stick",
    triggers: isBn ? "অ্যানালগ ট্রিগার (L2 / R2)" : "Analog Triggers (L2 / R2)",
    buttonsTitle: isBn ? "সব বাটন স্ট্যাটাস" : "Live Buttons Matrix",
    driftOk: isBn ? "ড্রিফট নেই (Clean)" : "Center Clean",
    driftWarn: isBn ? "স্টিক ড্রিফট শনাক্ত!" : "Stick Drift Detected!"
  };

  const buttonNames = [
    "A / ✕", "B / ○", "X / □", "Y / △",
    "L1 / LB", "R1 / RB", "L2 / LT", "R2 / RT",
    "Select / Share", "Start / Options", "L3 Press", "R3 Press",
    "D-Up", "D-Down", "D-Left", "D-Right", "Home / PS"
  ];

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Waiting Banner -->
      <div id="gp-waiting" class="rounded-2xl p-8 bg-gradient-to-br from-slate-900 via-[#101536] to-slate-900 border border-indigo-500/30 text-center text-white">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center animate-pulse">
          <i data-lucide="gamepad-2" class="w-9 h-9"></i>
        </div>
        <h3 class="text-base sm:text-lg font-extrabold mb-1.5">${T.waitingTitle}</h3>
        <p class="text-xs text-slate-400 max-w-md mx-auto">${T.waitingDesc}</p>
      </div>

      <!-- Active Controller Dashboard -->
      <div id="gp-active" class="hidden space-y-5">
        <!-- Controller Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
            <div class="min-w-0">
              <div class="text-[10px] font-extrabold uppercase text-emerald-400">${T.connected}</div>
              <div id="gp-name" class="text-xs sm:text-sm font-extrabold truncate">—</div>
            </div>
          </div>
          <button id="gp-rumble-btn" class="btn-aurora btn-shimmer px-4 py-2 rounded-xl text-xs font-extrabold text-white inline-flex items-center gap-1.5">
            <i data-lucide="vibrate" class="w-4 h-4"></i> ${T.vibrateBtn}
          </button>
        </div>

        <!-- Dual Analog Sticks & Drift Checker -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${[
            { id: "l", title: T.leftStick },
            { id: "r", title: T.rightStick }
          ]
            .map(
              (s) => `
            <div class="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col items-center">
              <div class="w-full flex items-center justify-between mb-3">
                <span class="text-xs font-extrabold">${s.title}</span>
                <span id="gp-drift-${s.id}" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400">${T.driftOk}</span>
              </div>
              <div class="relative w-36 h-36 rounded-full bg-slate-950 border-2 border-cyan-500/35 flex items-center justify-center">
                <!-- Crosshair -->
                <div class="absolute inset-x-0 h-px bg-white/10"></div>
                <div class="absolute inset-y-0 w-px bg-white/10"></div>
                <!-- Deadzone Ring -->
                <div class="w-6 h-6 rounded-full border border-dashed border-amber-400/50"></div>
                <!-- Moving Stick Dot -->
                <div id="gp-dot-${s.id}" class="absolute w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-cyan-400/50 transition-transform duration-75"></div>
              </div>
              <div class="flex gap-4 mt-3 text-[11px] font-mono font-bold text-slate-400">
                <span>X: <strong id="gp-x-${s.id}" class="text-cyan-400">0.000</strong></span>
                <span>Y: <strong id="gp-y-${s.id}" class="text-fuchsia-400">0.000</strong></span>
              </div>
            </div>`
            )
            .join("")}
        </div>

        <!-- Analog Triggers L2 / R2 -->
        <div class="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
          <div class="text-xs font-extrabold">${T.triggers}</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div class="flex justify-between text-[11px] font-bold mb-1"><span>L2 / LT</span><span id="gp-l2-val" class="text-emerald-400">0%</span></div>
              <div class="h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <div id="gp-l2-bar" class="h-full w-0 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-[11px] font-bold mb-1"><span>R2 / RT</span><span id="gp-r2-val" class="text-fuchsia-400">0%</span></div>
              <div class="h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <div id="gp-r2-bar" class="h-full w-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Buttons Matrix -->
        <div class="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
          <div class="text-xs font-extrabold">${T.buttonsTitle}</div>
          <div id="gp-buttons-grid" class="grid grid-cols-3 sm:grid-cols-6 gap-2">
            ${buttonNames
              .map(
                (label, idx) => `
              <div data-gp-btn="${idx}" class="gp-btn px-2 py-2.5 rounded-xl text-center text-[11px] font-extrabold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 transition-all duration-75">
                ${label}
              </div>`
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const waitingEl = container.querySelector("#gp-waiting");
  const activeEl = container.querySelector("#gp-active");
  const nameEl = container.querySelector("#gp-name");
  const rumbleBtn = container.querySelector("#gp-rumble-btn");

  let rafId = null;
  let activeIndex = null;

  function updateStick(side, x, y) {
    const dot = container.querySelector(`#gp-dot-${side}`);
    const xEl = container.querySelector(`#gp-x-${side}`);
    const yEl = container.querySelector(`#gp-y-${side}`);
    const driftEl = container.querySelector(`#gp-drift-${side}`);

    const px = Math.max(-52, Math.min(52, x * 52));
    const py = Math.max(-52, Math.min(52, y * 52));
    dot.style.transform = `translate(${px}px, ${py}px)`;
    xEl.textContent = x.toFixed(3);
    yEl.textContent = y.toFixed(3);

    const mag = Math.hypot(x, y);
    if (mag > 0.07 && mag < 0.35) {
      driftEl.textContent = T.driftWarn;
      driftEl.className = "px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400";
    } else if (mag <= 0.07) {
      driftEl.textContent = T.driftOk;
      driftEl.className = "px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400";
    } else {
      driftEl.textContent = "Active Input";
      driftEl.className = "px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400";
    }
  }

  function pollGamepad() {
    if (!container.isConnected) return;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;
    for (let i = 0; i < pads.length; i++) {
      if (pads[i]) {
        gp = pads[i];
        activeIndex = i;
        break;
      }
    }

    if (gp) {
      waitingEl.classList.add("hidden");
      activeEl.classList.remove("hidden");
      nameEl.textContent = gp.id;

      // Update Sticks
      updateStick("l", gp.axes[0] || 0, gp.axes[1] || 0);
      updateStick("r", gp.axes[2] || 0, gp.axes[3] || 0);

      // Update Analog Triggers (standard index 6 = L2, 7 = R2)
      const l2 = Math.round(((gp.buttons[6]?.value) || 0) * 100);
      const r2 = Math.round(((gp.buttons[7]?.value) || 0) * 100);
      container.querySelector("#gp-l2-val").textContent = `${l2}%`;
      container.querySelector("#gp-l2-bar").style.width = `${l2}%`;
      container.querySelector("#gp-r2-val").textContent = `${r2}%`;
      container.querySelector("#gp-r2-bar").style.width = `${r2}%`;

      // Update Buttons Grid
      gp.buttons.forEach((btn, idx) => {
        const elBtn = container.querySelector(`[data-gp-btn="${idx}"]`);
        if (!elBtn) return;
        if (btn.pressed) {
          elBtn.classList.remove("bg-slate-100", "dark:bg-slate-900", "border-slate-200", "dark:border-white/10");
          elBtn.classList.add("bg-emerald-500", "text-white", "border-emerald-300", "scale-95", "shadow-lg");
        } else {
          elBtn.classList.remove("bg-emerald-500", "text-white", "border-emerald-300", "scale-95", "shadow-lg");
          elBtn.classList.add("bg-slate-100", "dark:bg-slate-900", "border-slate-200", "dark:border-white/10");
        }
      });
    } else {
      waitingEl.classList.remove("hidden");
      activeEl.classList.add("hidden");
    }

    rafId = requestAnimationFrame(pollGamepad);
  }
  rafId = requestAnimationFrame(pollGamepad);

  // Vibration / Rumble Test
  rumbleBtn.addEventListener("click", () => {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = activeIndex !== null ? pads[activeIndex] : null;
    if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === "function") {
      gp.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: 450,
        weakMagnitude: 0.7,
        strongMagnitude: 1.0
      }).catch(() => {});
    } else {
      alert(isBn ? "এই কন্ট্রোলার বা ব্রাউজার ভাইব্রেশন সাপোর্ট করে না।" : "Vibration API is not supported by this browser/controller.");
    }
  });

  // Auto-Cleanup
  window.addEventListener("hashchange", function cleanup() {
    cancelAnimationFrame(rafId);
    window.removeEventListener("hashchange", cleanup);
  });
};