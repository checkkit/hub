(function () {
  function isProUser() {
    try {
      const user = JSON.parse(localStorage.getItem("ck_user") || "null");
      return Boolean(user && user.plan === "PRO");
    } catch (_) {
      return false;
    }
  }

  // Adsterra atOptions ব্যানারের জন্য আইসোলেটেড iframe ইনজেক্টর (একাধিক ব্যানার কনফ্লিক্ট ঠেকায়)
  function mountBannerIframe(containerId, adHtml, width, height) {
    const box = document.getElementById(containerId);
    if (!box || !adHtml || !adHtml.trim()) return;

    box.innerHTML = "";
    box.classList.remove("border-dashed");
    box.style.minHeight = `${height}px`;

    const iframe = document.createElement("iframe");
    iframe.width = width;
    iframe.height = height;
    iframe.frameBorder = "0";
    iframe.scrolling = "no";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.style.maxWidth = "100%";
    iframe.style.display = "block";
    iframe.style.margin = "0 auto";
    iframe.srcdoc = `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center;overflow:hidden;}</style></head><body>${adHtml}</body></html>`;

    box.appendChild(iframe);
  }

  // Native Banner-এর মতো ডিরেক্ট DOM + Script ইনজেক্টর
  function mountInlineAd(containerId, adHtml) {
    const box = document.getElementById(containerId);
    if (!box || !adHtml || !adHtml.trim()) return;

    box.innerHTML = "";
    box.classList.remove("border-dashed");

    const temp = document.createElement("div");
    temp.innerHTML = adHtml;

    Array.from(temp.childNodes).forEach((node) => {
      if (node.tagName === "SCRIPT") {
        const script = document.createElement("script");
        Array.from(node.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
        if (node.textContent) script.textContent = node.textContent;
        box.appendChild(script);
      } else {
        box.appendChild(node.cloneNode(true));
      }
    });
  }

  // গ্লোবাল স্ক্রিপ্ট ইনজেক্টর (Adsterra Social Bar / Monetag Vignette / In-Page Push)
  function injectGlobalScripts(scriptList) {
    if (!Array.isArray(scriptList)) return;
    scriptList.forEach((item) => {
      if (!item) return;

      // শুধু URL স্ট্রিং দিলে
      if (typeof item === "string" && item.trim()) {
        const s = document.createElement("script");
        s.src = item.trim();
        s.async = true;
        document.body.appendChild(s);
        return;
      }

      // Monetag-এর data-zone অ্যাট্রিবিউটসহ অবজেক্ট দিলে
      if (typeof item === "object" && item.src) {
        const s = document.createElement("script");
        s.src = item.src;
        s.async = true;
        if (item.attrs) {
          Object.entries(item.attrs).forEach(([k, v]) => s.setAttribute(k, v));
        }
        document.body.appendChild(s);
      }
    });
  }

  function initAds() {
    const CFG = window.APP_CONFIG;
    const ads = CFG && CFG.ads;

    // Pro ইউজার হলে অথবা অফলাইনে থাকলে কোনো অ্যাড লোড হবে না
    if (isProUser() || !navigator.onLine || !ads || !ads.enabled) {
      if (isProUser()) {
        document.querySelectorAll(".ad-slot-box").forEach((b) => b.classList.add("hidden"));
      }
      return;
    }

    const isMobile = window.innerWidth < 768;

    // 1. Top Banner (ডেস্কটপে 728x90, মোবাইলে 320x50)
    if (isMobile && ads.topBannerMobileHtml) {
      mountBannerIframe("ad-slot-top", ads.topBannerMobileHtml, 320, 50);
    } else if (ads.topBannerDesktopHtml) {
      mountBannerIframe("ad-slot-top", ads.topBannerDesktopHtml, 728, 90);
    }

    // 2. Below-Tool Slot (Adsterra Native Banner সবচেয়ে ভালো পারফর্ম করে)
    if (ads.belowToolNativeHtml) {
      mountInlineAd("ad-slot-below", ads.belowToolNativeHtml);
    }

    // 3. Sidebar Slot (300x250 Medium Rectangle)
    if (ads.sidebarBanner300x250Html) {
      mountBannerIframe("ad-slot-sidebar", ads.sidebarBanner300x250Html, 300, 250);
    }

    // 4. Global Floating/Vignette Scripts (Social Bar / Monetag In-Page Push / Vignette)
    injectGlobalScripts(ads.globalScripts);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAds);
  } else {
    initAds();
  }
})();