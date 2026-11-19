(function () {
  function initScorecardExporter() {
    const exportBtn = document.getElementById("export-scorecard-btn");
    const listWrap = document.getElementById("scorecard-list");
    if (!exportBtn || !listWrap) return;

    // মডালের ভেতরে অপশনাল "Device Model / Name" ইনপুট বক্স অটোমেটিক যোগ করা
    if (!document.getElementById("sc-device-model")) {
      const inputWrap = document.createElement("div");
      inputWrap.className = "mb-4";
      inputWrap.innerHTML = `
        <label for="sc-device-model" class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
          Device Model / Note (Printed on Report Card)
        </label>
        <input
          id="sc-device-model"
          type="text"
          maxlength="48"
          placeholder="e.g. iPhone 13 Pro 128GB / MacBook Air M2"
          class="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      `;
      listWrap.parentNode.insertBefore(inputWrap, listWrap);
    }

    // Safari/iOS-সেফ Rounded Rectangle হেল্পার
    function drawRoundRect(ctx, x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    }

    // কাস্টম লোগো লোডার (file:// বা CORS এরর হলেও যেন ডাউনলোড না আটকায়)
    function loadSafeLogo(src) {
      return new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const testCanvas = document.createElement("canvas");
            testCanvas.width = 4;
            testCanvas.height = 4;
            const tctx = testCanvas.getContext("2d");
            tctx.drawImage(img, 0, 0, 4, 4);
            testCanvas.toDataURL(); // Taint চেক
            resolve(img);
          } catch (e) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = src;
      });
    }

    // অটোমেটিক ডিভাইস ইনফো ডিটেক্টর
    function getDeviceSummary() {
      const ua = navigator.userAgent;
      let os = "Unknown OS";
      if (/iPhone|iPad|iPod/i.test(ua)) os = "Apple iOS";
      else if (/Android/i.test(ua)) os = "Android";
      else if (/Mac OS X/i.test(ua)) os = "macOS";
      else if (/Windows/i.test(ua)) os = "Windows";
      else if (/Linux/i.test(ua)) os = "Linux";

      let browser = "Browser";
      if (/Edg\//i.test(ua)) browser = "Edge";
      else if (/Chrome\//i.test(ua)) browser = "Chrome";
      else if (/Safari\//i.test(ua)) browser = "Safari";
      else if (/Firefox\//i.test(ua)) browser = "Firefox";

      const dpr = (window.devicePixelRatio || 1).toFixed(1);
      const res = `${window.screen.width}x${window.screen.height} @${dpr}x`;
      const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : "Standard CPU";
      return { os, browser, res, cores };
    }

    async function generateReportPNG() {
      const CFG = window.APP_CONFIG;
      const lang = localStorage.getItem("ck_lang") || CFG.defaultLang || "en";
      const isBn = lang === "bn";
      const user = JSON.parse(localStorage.getItem("ck_user") || "null");
      const scorecard = JSON.parse(localStorage.getItem("ck_scorecard") || "{}");
      const isPro = Boolean(user && user.plan === "PRO");

      const modelInput = document.getElementById("sc-device-model");
      const customModel = modelInput ? modelInput.value.trim() : "";

      const hwTools = CFG.tools.filter((t) => t.scorecard);
      const passedCount = hwTools.filter((t) => scorecard[t.id] === "pass").length;
      const failedCount = hwTools.filter((t) => scorecard[t.id] === "fail").length;
      const pendingCount = hwTools.length - passedCount - failedCount;
      const scorePct = Math.round((passedCount / hwTools.length) * 100);

      const dev = getDeviceSummary();
      const brandName = CFG.brandName || "CheckKit";
      const siteDomain = window.location.hostname || `${brandName.toLowerCase()}.app`;
      const reportId = `CK-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const dateStr = new Date().toLocaleString(isBn ? "bn-BD" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      // গুগল ফন্ট (Plus Jakarta Sans + Hind Siliguri) লোড হওয়া পর্যন্ত অপেক্ষা
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const logoImg = await loadSafeLogo(CFG.logoPath);

      const W = 1080;
      const H = 1440;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      const fontStack = '"Plus Jakarta Sans", "Hind Siliguri", -apple-system, sans-serif';

      // ==================== 1. SAAS DARK AURORA BACKGROUND ====================
      ctx.fillStyle = "#050816";
      ctx.fillRect(0, 0, W, H);

      // Top-Left Emerald Glow
      const g1 = ctx.createRadialGradient(140, 140, 30, 140, 140, 520);
      g1.addColorStop(0, "rgba(16, 185, 129, 0.24)");
      g1.addColorStop(1, "rgba(5, 8, 22, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // Top-Right Indigo/Fuchsia Glow
      const g2 = ctx.createRadialGradient(W - 120, 260, 30, W - 120, 260, 540);
      g2.addColorStop(0, "rgba(99, 102, 241, 0.26)");
      g2.addColorStop(1, "rgba(5, 8, 22, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // Bottom Cyan Glow
      const g3 = ctx.createRadialGradient(W / 2, H - 100, 40, W / 2, H - 100, 500);
      g3.addColorStop(0, "rgba(6, 182, 212, 0.16)");
      g3.addColorStop(1, "rgba(5, 8, 22, 0)");
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, W, H);

      // Subtle SaaS Dot Grid
      ctx.fillStyle = "rgba(148, 163, 184, 0.12)";
      for (let gx = 40; gx < W; gx += 40) {
        for (let gy = 40; gy < H; gy += 40) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Outer Card Border Frame
      drawRoundRect(ctx, 36, 36, W - 72, H - 72, 36);
      ctx.strokeStyle = isPro ? "rgba(245, 158, 11, 0.45)" : "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // ==================== 2. HEADER (LOGO + BADGE) ====================
      const padX = 84;
      let curY = 86;

      // Logo Box
      drawRoundRect(ctx, padX, curY, 76, 76, 20);
      const logoGrad = ctx.createLinearGradient(padX, curY, padX + 76, curY + 76);
      logoGrad.addColorStop(0, "#10b981");
      logoGrad.addColorStop(0.5, "#06b6d4");
      logoGrad.addColorStop(1, "#6366f1");
      ctx.fillStyle = logoGrad;
      ctx.fill();

      if (logoImg) {
        ctx.save();
        drawRoundRect(ctx, padX + 6, curY + 6, 64, 64, 14);
        ctx.clip();
        ctx.drawImage(logoImg, padX + 6, curY + 6, 64, 64);
        ctx.restore();
      } else {
        // Fallback Vector Check Shield
        ctx.fillStyle = "#ffffff";
        ctx.font = `800 38px ${fontStack}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✓", padX + 38, curY + 40);
      }

      // Brand Name & Subtitle
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 38px ${fontStack}`;
      ctx.fillText(brandName, padX + 98, curY + 40);

      ctx.fillStyle = "#34d399";
      ctx.font = `700 18px ${fontStack}`;
      ctx.fillText(
        isBn ? "ডিভাইস হেলথ ডায়াগনস্টিক রিপোর্ট" : "DEVICE HEALTH DIAGNOSTIC REPORT",
        padX + 98,
        curY + 68
      );

      // Right Side Plan Badge
      const badgeText = isPro ? "★ PRO CERTIFIED" : "FREE DIAGNOSTIC";
      ctx.font = `800 17px ${fontStack}`;
      const badgeW = ctx.measureText(badgeText).width + 44;
      const badgeX = W - padX - badgeW;
      drawRoundRect(ctx, badgeX, curY + 14, badgeW, 44, 22);
      if (isPro) {
        const proGrad = ctx.createLinearGradient(badgeX, curY, badgeX + badgeW, curY + 44);
        proGrad.addColorStop(0, "#d946ef");
        proGrad.addColorStop(1, "#f59e0b");
        ctx.fillStyle = proGrad;
      } else {
        ctx.fillStyle = "rgba(6, 182, 212, 0.18)";
        ctx.strokeStyle = "rgba(34, 211, 238, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.fill();
      ctx.fillStyle = isPro ? "#ffffff" : "#67e8f9";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(badgeText, badgeX + badgeW / 2, curY + 37);

      // Divider
      curY += 108;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padX, curY);
      ctx.lineTo(W - padX, curY);
      ctx.stroke();

      // ==================== 3. HERO SCORE GAUGE + DEVICE INFO ====================
      curY += 34;
      const heroH = 264;
      drawRoundRect(ctx, padX, curY, W - padX * 2, heroH, 28);
      ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Circular Health Ring
      const cx = padX + 145;
      const cy = curY + heroH / 2;
      const radius = 84;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 18;
      ctx.stroke();

      const ringColor = failedCount > 0 ? "#f43f5e" : scorePct >= 80 ? "#10b981" : "#f59e0b";
      const endAngle = -Math.PI / 2 + (Math.PI * 2 * Math.max(scorePct, 2)) / 100;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, endAngle);
      ctx.strokeStyle = ringColor;
      ctx.lineCap = "round";
      ctx.lineWidth = 18;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 44px ${fontStack}`;
      ctx.fillText(`${scorePct}%`, cx, cy - 6);

      ctx.fillStyle = "#94a3b8";
      ctx.font = `700 14px ${fontStack}`;
      ctx.fillText(isBn ? "হেলথ স্কোর" : "HEALTH SCORE", cx, cy + 32);

      // Right Side Info Block inside Hero
      const infoX = padX + 275;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      ctx.fillStyle = "#94a3b8";
      ctx.font = `700 15px ${fontStack}`;
      ctx.fillText(isBn ? "ডিভাইস ও পরীক্ষার তথ্য" : "TESTED DEVICE & METADATA", infoX, curY + 52);

      ctx.fillStyle = "#ffffff";
      ctx.font = `800 30px ${fontStack}`;
      const displayDevice = customModel || `${dev.os} Device (${dev.browser})`;
      ctx.fillText(displayDevice.slice(0, 32), infoX, curY + 94);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = `600 18px ${fontStack}`;
      ctx.fillText(`${dev.os}  •  ${dev.res}  •  ${dev.cores}`, infoX, curY + 132);

      ctx.fillStyle = "#64748b";
      ctx.font = `600 16px monospace`;
      ctx.fillText(`ID: ${reportId}   |   ${dateStr}`, infoX, curY + 166);

      // 3 Summary Stat Pills (Passed / Issues / Pending)
      const pills = [
        { label: isBn ? `পাস: ${passedCount}` : `PASSED: ${passedCount}`, bg: "rgba(16,185,129,0.2)", fg: "#34d399" },
        { label: isBn ? `সমস্যা: ${failedCount}` : `ISSUES: ${failedCount}`, bg: "rgba(244,63,94,0.2)", fg: "#fb7185" },
        { label: isBn ? `বাকি: ${pendingCount}` : `PENDING: ${pendingCount}`, bg: "rgba(148,163,184,0.16)", fg: "#cbd5e1" }
      ];
      let px = infoX;
      const py = curY + 192;
      ctx.font = `800 16px ${fontStack}`;
      pills.forEach((p) => {
        const pw = ctx.measureText(p.label).width + 34;
        drawRoundRect(ctx, px, py, pw, 42, 12);
        ctx.fillStyle = p.bg;
        ctx.fill();
        ctx.fillStyle = p.fg;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.label, px + pw / 2, py + 22);
        px += pw + 14;
      });

      // ==================== 4. HARDWARE CHECKLIST ROWS (7 TESTS) ====================
      curY += heroH + 42;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 24px ${fontStack}`;
      ctx.fillText(
        isBn ? "হার্ডওয়্যার ডায়াগনস্টিক ফলাফল (৭টি পরীক্ষা)" : "Hardware Diagnostic Breakdown (7 Core Checks)",
        padX,
        curY
      );

      curY += 24;
      const rowH = 82;
      const rowGap = 14;

      hwTools.forEach((tool, idx) => {
        const y = curY + idx * (rowH + rowGap);
        const status = scorecard[tool.id]; // "pass" | "fail" | undefined

        drawRoundRect(ctx, padX, y, W - padX * 2, rowH, 20);
        ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
        ctx.fill();
        ctx.strokeStyle =
          status === "pass"
            ? "rgba(16, 185, 129, 0.38)"
            : status === "fail"
            ? "rgba(244, 63, 94, 0.45)"
            : "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Index Circle
        ctx.beginPath();
        ctx.arc(padX + 42, y + rowH / 2, 19, 0, Math.PI * 2);
        ctx.fillStyle =
          status === "pass"
            ? "rgba(16, 185, 129, 0.2)"
            : status === "fail"
            ? "rgba(244, 63, 94, 0.2)"
            : "rgba(148, 163, 184, 0.14)";
        ctx.fill();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = status === "pass" ? "#34d399" : status === "fail" ? "#fb7185" : "#94a3b8";
        ctx.font = `800 18px ${fontStack}`;
        ctx.fillText(String(idx + 1), padX + 42, y + rowH / 2 + 1);

        // Tool Title
        ctx.textAlign = "left";
        ctx.fillStyle = "#f8fafc";
        ctx.font = `700 22px ${fontStack}`;
        const labelText = tool.name[lang] || tool.name.en;
        ctx.fillText(labelText, padX + 82, y + rowH / 2 + 1);

        // Right Status Pill
        let stText = isBn ? "পরীক্ষা হয়নি" : "NOT TESTED";
        let stBg = "rgba(148, 163, 184, 0.15)";
        let stFg = "#94a3b8";

        if (status === "pass") {
          stText = isBn ? "✓ পাস (ঠিক আছে)" : "✓ PASSED";
          stBg = "rgba(16, 185, 129, 0.22)";
          stFg = "#34d399";
        } else if (status === "fail") {
          stText = isBn ? "✕ সমস্যা পাওয়া গেছে" : "✕ ISSUE FOUND";
          stBg = "rgba(244, 63, 94, 0.24)";
          stFg = "#fb7185";
        }

        ctx.font = `800 17px ${fontStack}`;
        const sw = Math.max(150, ctx.measureText(stText).width + 40);
        const sx = W - padX - sw - 22;
        const sy = y + (rowH - 44) / 2;

        drawRoundRect(ctx, sx, sy, sw, 44, 14);
        ctx.fillStyle = stBg;
        ctx.fill();

        ctx.textAlign = "center";
        ctx.fillStyle = stFg;
        ctx.fillText(stText, sx + sw / 2, sy + 23);
      });

      // ==================== 5. FREE USER WATERMARK VS PRO CLEAN FOOTER ====================
      if (!isPro) {
        // Diagonal Semi-Transparent Watermark (Free Tier Only)
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillStyle = "rgba(255, 255, 255, 0.055)";
        ctx.font = `800 54px ${fontStack}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const wmText = `${brandName.toUpperCase()}  •  FREE REPORT  •  ${siteDomain}`;
        for (let wy = -460; wy <= 460; wy += 230) {
          ctx.fillText(wmText, 0, wy);
        }
        ctx.restore();
      }

      // Footer Bar
      const footerY = H - 154;
      drawRoundRect(ctx, padX, footerY, W - padX * 2, 78, 20);
      if (isPro) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
        ctx.strokeStyle = "rgba(52, 211, 153, 0.35)";
      } else {
        ctx.fillStyle = "rgba(99, 102, 241, 0.14)";
        ctx.strokeStyle = "rgba(129, 140, 248, 0.35)";
      }
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (isPro) {
        ctx.fillStyle = "#34d399";
        ctx.font = `800 19px ${fontStack}`;
        const owner = user && user.name ? ` • Certified for ${user.name}` : "";
        ctx.fillText(`✓ Official Watermark-Free Pro Report${owner}`, W / 2, footerY + 28);
        ctx.fillStyle = "#94a3b8";
        ctx.font = `600 15px ${fontStack}`;
        ctx.fillText(`Verified locally in browser • Report ID: ${reportId}`, W / 2, footerY + 54);
      } else {
        ctx.fillStyle = "#67e8f9";
        ctx.font = `800 19px ${fontStack}`;
        ctx.fillText(
          isBn
            ? `ফ্রি টেস্ট করা হয়েছে: ${brandName} (${siteDomain})`
            : `Verified Free via ${brandName} (${siteDomain})`,
          W / 2,
          footerY + 28
        );
        ctx.fillStyle = "#cbd5e1";
        ctx.font = `600 15px ${fontStack}`;
        ctx.fillText(
          isBn
            ? "ওয়াটারমার্ক ছাড়া প্রফেশনাল রিপোর্টের জন্য CheckKit Pro আনলক করুন"
            : "Upgrade to Pro on CheckKit for Clean Watermark-Free Certified Reports",
          W / 2,
          footerY + 54
        );
      }

      // ==================== 6. EXPORT & DOWNLOAD PNG ====================
      const stamp = new Date().toISOString().slice(0, 10);
      const fileName = `${brandName.toLowerCase()}-health-report-${stamp}.png`;

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) return resolve(false);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 4000);
          resolve(true);
        }, "image/png");
      });
    }

    // বাটন ক্লিক ইভেন্ট
    exportBtn.addEventListener("click", async () => {
      const originalText = exportBtn.textContent;
      exportBtn.disabled = true;
      exportBtn.textContent = "Generating PNG...";
      try {
        await generateReportPNG();
        exportBtn.textContent = "✓ PNG Downloaded!";
      } catch (err) {
        exportBtn.textContent = "Export Failed";
      } finally {
        setTimeout(() => {
          exportBtn.disabled = false;
          exportBtn.textContent = originalText;
        }, 1800);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScorecardExporter);
  } else {
    initScorecardExporter();
  }
})();