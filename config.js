window.APP_CONFIG = {
  brandName: "CheckKit",
  logoPath: "assets/logo.png", // তোমার লোগো ফাইলের নাম ও পাথ এখানে দাও
  defaultLang: "en",

  // 100% FREE SERVERLESS BACKEND (GitHub Pages + Cloudflare + Google Sheets)
  backend: {
    // নিচে দেওয়া Google Apps Script ডিপ্লয় করে পাওয়া URL এখানে বসাও।
    // খালি রাখলে সাইটটি অটোমেটিক Local Demo মোডে লগইন/রেজিস্ট্রেশন চালাবে।
    googleSheetAuthUrl: "https://script.google.com/macros/s/AKfycbxIKLV9jyQXLtwnE24wrt18uidAU5QGn7WH4llQ57DJlnO4i0ZA2H-yTyJ0JdnBLOngiw/exec",
    cloudflareWorkerUrl: "https://checkkit-url-scanner.mayamonicollection.workers.dev",
  },

  // Monetization & Payment Links
  payments: {
    globalCheckoutUrl: "https://your-lemonsqueezy-or-gumroad-link.com",
    bkashNumber: "017XXXXXXXX",
  },
// Adsterra Live Ads Config (Pro ইউজারদের জন্য অটোমেটিক বন্ধ থাকবে)
  ads: {
    enabled: true,

    // ১. Adsterra 728x90 Banner (Desktop Top)
    topBannerDesktopHtml: `<script>
      atOptions = {
        'key' : '2273f2917c51216bcd1f82d6b8905eb0',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    </script>
    <script src="https://bauval.org/22/2273f2917c51216bcd1f82d6b8905eb0"></script>`,

    // ২. Adsterra 320x50 Banner (Mobile Top)
    topBannerMobileHtml: `<script>
      atOptions = {
        'key' : '8e31fb3a841024580051c6ae233b6782',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    </script>
    <script src="https://bauval.org/22/8e31fb3a841024580051c6ae233b6782"></script>`,

    // ৩. Adsterra Native Banner (Below Every Tool — 4:1 Layout)
    belowToolNativeHtml: `<div id="container-0741474626c04f46b27dd32aedfd6e32"></div>
    <script async="async" data-cfasync="false" src="https://bauval.org/21/0741474626c04f46b27dd32aedfd6e32"></script>`,

    // ৪. Adsterra 300x250 Banner (Right Sidebar)
    sidebarBanner300x250Html: `<script>
      atOptions = {
        'key' : '434b265de435675365615fc2b448b20a',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    </script>
    <script src="https://bauval.org/22/434b265de435675365615fc2b448b20a"></script>`,

    // ৫. Adsterra Social Bar (Global Floating High-CTR)
    
  },

  // Context-Aware Smart Affiliate Cards
  affiliates: {
    privacy: {
      badge: "PRIVACY SHIELD",
      title: { en: "Hide Your Real IP & Stop WebRTC Leaks", bn: "আসল আইপি লুকান ও WebRTC লিক বন্ধ করুন" },
      desc: { en: "Encrypt public Wi-Fi and block ISP tracking with an audited No-Logs VPN.", bn: "পাবলিক ওয়াই-ফাই ও ট্র্যাকিং থেকে নিরাপদ থাকতে বিশ্বস্ত No-Logs VPN ব্যবহার করুন।" },
      cta: { en: "Get 70% Off NordVPN →", bn: "৭০% ছাড়ে VPN দেখুন →" },
      url: "https://example.com/vpn-affiliate",
      icon: "shield-alert"
    },
    hardware: {
      badge: "PRO GEAR UPGRADE",
      title: { en: "Mic, Mouse or Webcam Failing?", bn: "মাইক, মাউস বা ওয়েবক্যামে সমস্যা?" },
      desc: { en: "Browse top-rated replacements for remote work, streaming, and esports.", bn: "গেমিং, মিটিং ও ফ্রিল্যান্সিংয়ের সেরা বাজেট গ্যাজেটগুলো দেখে নিন।" },
      cta: { en: "Shop Top Rated Gear →", bn: "সেরা গ্যাজেট দেখুন →" },
      url: "https://example.com/amazon-gear",
      icon: "headphones"
    },
    security: {
      badge: "ANTI-SCAM SUITE",
      title: { en: "Block Phishing Links Automatically", bn: "ভুয়া লিংক ও ফিশিং অটো ব্লক করুন" },
      desc: { en: "Keep passwords and banking logins locked down across every device.", bn: "সব ডিভাইসে আপনার পাসওয়ার্ড ও ব্যাংকিং অ্যাকাউন্ট সুরক্ষিত রাখুন।" },
      cta: { en: "Try Password Manager →", bn: "পাসওয়ার্ড ম্যানেজার দেখুন →" },
      url: "https://example.com/security-affiliate",
      icon: "lock-keyhole"
    }
  },

  // EN / BN Translations
  i18n: {
    en: {
      scorecardBtn: "Scorecard",
      signIn: "Sign In",
      goPro: "Go Pro",
      heroBadge: "14+ Pro Tools • 100% Client-Side Safe • Global & BD Ready",
      heroTitle: "Test Your Hardware.",
      heroTitleLine2: "Lock Down Your Privacy.",
      heroSubtitle: "An international-grade browser toolkit for instant phone & PC diagnostics, IP/WebRTC leak detection, disposable temp mail, and anti-scam URL verification.",
      heroCta1: "Quick Hardware Check",
      heroCta2: "Scan IP & Privacy Leak",
      stat1: "Local Browser Safe",
      stat2: "Pro Diagnostic Tools",
      stat3: "No App Install",
      catAll: "All Tools",
      catHardware: "Hardware & Device",
      catPrivacy: "Privacy & IP",
      catSecurity: "Temp Mail & Anti-Scam",
      noResults: "No matching tool found. Try another keyword.",
      trust1Title: "Zero-Upload Architecture",
      trust1Desc: "Mic, camera, and photo EXIF tools process 100% locally in your browser—your files never touch a server.",
      trust2Title: "Used Phone Inspection Report",
      trust2Desc: "Verify screen, touch, speaker & mic before buying or selling a used phone and export a Health Scorecard.",
      trust3Title: "Cloud Sync & Pro Workspace",
      trust3Desc: "Create a free account to sync your scorecards, unlock ad-free mode, and access Pro anti-scam features.",
      backToAll: "All Tools",
      markTestResult: "Save result to Device Health Scorecard:",
      howToUseTitle: "How to Use & Frequently Asked Questions",
      relatedTools: "More Popular Tools",
      footerTagline: "International Hardware & Privacy SaaS Platform",
      scorecardTitle: "Device Health Scorecard",
      proTitle: "Upgrade to CheckKit Pro",
      proDesc: "Zero ads, custom domain temp mail, bulk scam link scanning & watermark-free PDF device reports.",
      searchPlaceholder: "Search mic, water eject, IP leak, temp mail...",
      openTool: "Launch Tool"
    },
    bn: {
      scorecardBtn: "স্কোরকার্ড",
      signIn: "লগইন",
      goPro: "প্রো ভার্সন",
      heroBadge: "১৪+ প্রো টুলস • ১০০% ব্রাউজারেই নিরাপদ • গ্লোবাল ও বাংলাদেশ",
      heroTitle: "ডিভাইস টেস্ট করুন।",
      heroTitleLine2: "প্রাইভেসি সুরক্ষিত রাখুন।",
      heroSubtitle: "মোবাইল ও ল্যাপটপের হার্ডওয়্যার চেকআপ, আইপি ও WebRTC লিক ডিটেকশন, টেম্প মেইল এবং স্ক্যাম লিংক যাচাইয়ের আন্তর্জাতিক মানের অল-ইন-ওয়ান টুলকিট।",
      heroCta1: "হার্ডওয়্যার টেস্ট শুরু করুন",
      heroCta2: "আইপি ও লিক চেক করুন",
      stat1: "ব্রাউজারেই প্রসেস হয়",
      stat2: "প্রো ডায়াগনস্টিক টুল",
      stat3: "কোনো অ্যাপ লাগে না",
      catAll: "সব টুলস",
      catHardware: "হার্ডওয়্যার ও ডিভাইস",
      catPrivacy: "প্রাইভেসি ও আইপি",
      catSecurity: "টেম্প মেইল ও সিকিউরিটি",
      noResults: "এই নামে কোনো টুল পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।",
      trust1Title: "শতভাগ প্রাইভেসি সুরক্ষিত",
      trust1Desc: "মাইক, ক্যামেরা ও ছবির সব পরীক্ষা সরাসরি আপনার ব্রাউজারেই হয়—সার্ভারে কিছুই আপলোড হয় না।",
      trust2Title: "পুরোনো ফোন কেনার আগে চেকআপ",
      trust2Desc: "ডিসপ্লে, টাচ, স্পিকার ও মাইক টেস্ট করে ফোনের ভেরিফায়েড হেলথ রিপোর্ট ডাউনলোড করুন।",
      trust3Title: "ফ্রি অ্যাকাউন্ট ও প্রো সুবিধা",
      trust3Desc: "অ্যাকাউন্ট খুলে রিপোর্ট সংরক্ষণ করুন এবং বিজ্ঞাপন-মুক্ত প্রো ফিচার উপভোগ করুন।",
      backToAll: "সব টুলস",
      markTestResult: "ডিভাইস হেলথ স্কোরকার্ডে রেজাল্ট সেভ করুন:",
      howToUseTitle: "ব্যবহারের নিয়ম ও সাধারণ প্রশ্নোত্তর",
      relatedTools: "আরও জনপ্রিয় টুলস",
      footerTagline: "ইন্টারন্যাশনাল হার্ডওয়্যার ও প্রাইভেসি SaaS প্ল্যাটফর্ম",
      scorecardTitle: "ডিভাইস হেলথ স্কোরকার্ড",
      proTitle: "CheckKit Pro-তে আপগ্রেড করুন",
      proDesc: "বিজ্ঞাপন-মুক্ত অভিজ্ঞতা, ওয়াটারমার্ক ছাড়া PDF রিপোর্ট ও প্রিমিয়াম সিকিউরিটি টুলস।",
      searchPlaceholder: "খুঁজুন: মাইক, স্পিকার পানি, আইপি, টেম্প মেইল...",
      openTool: "টুল চালু করুন"
    }
  },

  // 14 Modular Tools Registry
  tools: [
    {
      id: "speaker-water-eject", category: "hardware", icon: "volume-2", badge: "Viral", scorecard: true,
      name: { en: "Speaker Water Eject & Stereo", bn: "স্পিকার ওয়াটার ইজেক্ট ও সাউন্ড" },
      desc: { en: "165Hz calibrated sound waves to eject water/dust from speakers & verify L/R stereo.", bn: "১৬৫ হার্জ সাউন্ড ওয়েভে স্পিকারের পানি ও ধুলা বের করুন এবং বাম-ডান সাউন্ড চেক করুন।" },
      guide: { en: "Set phone volume to 100%, hold speakers downward, and run Water Eject for 20 seconds.", bn: "ফোনের ভলিউম সর্বোচ্চ করে স্পিকার নিচের দিকে ধরে ২০ সেকেন্ড চালান।" },
      faqs: [{ q: "Is 165Hz safe for phone speakers?", a: "Yes, it uses safe low-frequency vibration similar to Apple Watch water eject." }]
    },
    {
      id: "mic-test", category: "hardware", icon: "mic", badge: "Popular", scorecard: true,
      name: { en: "Microphone Live Tester", bn: "মাইক্রোফোন লাইভ টেস্টার" },
      desc: { en: "Real-time audio waveform, decibel meter & instant local playback before calls.", bn: "লাইভ সাউন্ড ওয়েভ, ডেসিবেল মিটার ও রেকর্ড-প্লেব্যাক করে মাইক্রোফোন পরীক্ষা করুন।" },
      guide: { en: "Click Start Mic Test, allow microphone access, and speak to verify audio clarity.", bn: "মাইক পারমিশন দিয়ে কথা বলুন—সাথে সাথেই লাইভ সাউন্ড ওয়েভ দেখতে পাবেন।" },
      faqs: [{ q: "Is my voice uploaded anywhere?", a: "Never. Everything runs 100% locally using the Web Audio API." }]
    },
    {
      id: "webcam-test", category: "hardware", icon: "camera", badge: "Local", scorecard: true,
      name: { en: "Webcam & FPS Inspector", bn: "ওয়েবক্যাম ও FPS টেস্টার" },
      desc: { en: "Test camera clarity, detect real resolution & FPS, and capture private snapshots.", bn: "ক্যামেরার আসল রেজোলিউশন, FPS ও ফোকাস যাচাই করুন কোনো আপলোড ছাড়াই।" },
      guide: { en: "Allow camera permission to inspect true video resolution and frame rate live.", bn: "ক্যামেরা পারমিশন দিয়ে লাইভ প্রিভিউ ও রেজোলিউশন চেক করুন।" },
      faqs: [{ q: "Does the camera stop when I close the tab?", a: "Yes, browser permissions terminate immediately upon leaving." }]
    },
    {
      id: "dead-pixel-hz", category: "hardware", icon: "monitor", badge: "Display", scorecard: true,
      name: { en: "Dead Pixel & Refresh Rate (Hz)", bn: "ডেড পিক্সেল ও রিফ্রেশ রেট (Hz)" },
      desc: { en: "Fullscreen pure color tester for dead pixels plus live 60Hz/120Hz/144Hz counter.", bn: "ডিসপ্লের ডেড পিক্সেল খুঁজুন এবং স্ক্রিনের আসল রিফ্রেশ রেট (Hz) পরীক্ষা করুন।" },
      guide: { en: "Launch fullscreen and tap to cycle solid Red, Green, Blue, White, and Black.", bn: "ফুলস্ক্রিন চালু করে প্রতিটি রঙে স্ক্রিনের কোথাও দাগ আছে কি না দেখুন।" },
      faqs: [{ q: "How do I identify a dead pixel?", a: "A permanent black dot on bright solid colors indicates a dead pixel." }]
    },
    {
      id: "touchscreen-test", category: "hardware", icon: "fingerprint", badge: "Used Phone", scorecard: true,
      name: { en: "Touchscreen & Multi-Touch Grid", bn: "টাচস্ক্রিন ও মাল্টি-টাচ টেস্ট" },
      desc: { en: "Interactive swipe grid to catch dead touch zones on used smartphones.", bn: "পুরোনো ফোন কেনার আগে স্ক্রিনের প্রতিটি কোণার টাচ ঠিক আছে কি না যাচাই করুন।" },
      guide: { en: "Swipe across every cell until the entire screen turns emerald green.", bn: "স্ক্রিনের প্রতিটি ঘরে আঙুল বোলান—কোনো ঘর সবুজ না হলে সেখানে টাচে সমস্যা আছে।" },
      faqs: [{ q: "Does it work on both iPhone and Android?", a: "Yes, works seamlessly in Safari, Chrome, and all modern mobile browsers." }]
    },
    {
      id: "keyboard-mouse-test", category: "hardware", icon: "mouse-pointer-click", badge: "Esports", scorecard: true,
      name: { en: "Keyboard & Mouse Double-Click", bn: "কিবোর্ড ও মাউস ডাবল-ক্লিক টেস্ট" },
      desc: { en: "Catch faulty mouse double-clicks under 80ms, measure Hz polling rate & test keys.", bn: "মাউসের ডাবল-ক্লিক সমস্যা, পোলিং রেট (Hz) এবং কিবোর্ডের প্রতিটি বাটন চেক করুন।" },
      guide: { en: "Click steadily in the test pad to flag switch bounce or press keyboard keys.", bn: "মাউস প্যাডে ক্লিক করে ডাবল-ক্লিক ত্রুটি ধরুন অথবা কিবোর্ড বাটন চেপে দেখুন।" },
      faqs: [{ q: "What is polling rate?", a: "How many times per second your mouse reports position to your PC (125Hz–1000Hz+)." }]
    },
    {
      id: "gamepad-test", category: "hardware", icon: "gamepad-2", badge: "Drift Check", scorecard: true,
      name: { en: "Gamepad & Stick Drift Tester", bn: "গেমপ্যাড ও জয়স্টিক ড্রিফট টেস্ট" },
      desc: { en: "Verify PS5, Xbox & USB controller buttons, triggers, and analog stick drift.", bn: "কন্ট্রোলারের সব বাটন, ট্রিগার ও জয়স্টিক ড্রিফট সমস্যা লাইভ পরীক্ষা করুন।" },
      guide: { en: "Plug in or pair your controller and press any button to start live telemetry.", bn: "কন্ট্রোলার কানেক্ট করে যেকোনো বাটন চাপলেই লাইভ স্ট্যাটাস দেখা যাবে।" },
      faqs: [{ q: "Why check stick drift?", a: "Even 0.05 axis drift can ruin aim in competitive shooters." }]
    },
    {
      id: "ip-webrtc-leak", category: "privacy", icon: "globe-lock", badge: "High Demand", scorecard: false,
      name: { en: "IP, ISP & WebRTC Leak Test", bn: "আইপি, আইএসপি ও WebRTC লিক টেস্ট" },
      desc: { en: "Inspect public IP, ISP, geolocation, timezone mismatch & hidden WebRTC VPN leaks.", bn: "আপনার আসল আইপি, আইএসপি, টাইমজোন ও ভিপিএন থেকে WebRTC লিক হচ্ছে কি না দেখুন।" },
      guide: { en: "Run this check while your VPN is active to confirm zero real IP exposure.", bn: "ভিপিএন চালু রেখে চেক করুন আপনার আসল আইপি বা টাইমজোন লিক হচ্ছে কি না।" },
      faqs: [{ q: "What is a WebRTC leak?", a: "A browser mechanism that can expose your real IP address behind a VPN." }]
    },
    {
      id: "browser-fingerprint", category: "privacy", icon: "scan-eye", badge: "Pro Audit", scorecard: false,
      name: { en: "Browser Fingerprint Inspector", bn: "ব্রাউজার ফিঙ্গারপ্রিন্ট ও UA চেকার" },
      desc: { en: "Audit User-Agent, GPU WebGL renderer, Canvas hash & tracking uniqueness.", bn: "ওয়েবসাইটগুলো আপনার ব্রাউজার, জিপিইউ ও ক্যানভাস সম্পর্কে কী তথ্য পায় তা দেখুন।" },
      guide: { en: "Review your live browser attributes to see how uniquely trackers can identify you.", bn: "পেজটি ওপেন করলেই আপনার ব্রাউজারের সম্পূর্ণ ফিঙ্গারপ্রিন্ট স্কোর দেখতে পাবেন।" },
      faqs: [{ q: "Can websites track me without cookies?", a: "Yes, by combining GPU, screen, font, and canvas hashes." }]
    },
    {
      id: "exif-remover", category: "privacy", icon: "image-off", badge: "100% Local", scorecard: false,
      name: { en: "Photo EXIF & GPS Stripper", bn: "ছবির EXIF ও GPS লোকেশন রিমুভার" },
      desc: { en: "View hidden GPS location & camera tags inside photos and wipe them in 1 click.", bn: "ছবির ভেতরের গোপন GPS লোকেশন ও ফোনের তথ্য দেখুন এবং এক ক্লিকে মুছে ফেলুন।" },
      guide: { en: "Select any photo to inspect metadata and export a completely clean copy locally.", bn: "যেকোনো ছবি সিলেক্ট করুন—ব্রাউজারেই সমস্ত গোপন ডেটা মুছে নতুন ছবি তৈরি হবে।" },
      faqs: [{ q: "Are my photos uploaded to a server?", a: "No, stripping happens locally on HTML5 Canvas." }]
    },
    {
      id: "ping-jitter-test", category: "privacy", icon: "activity", badge: "Network", scorecard: false,
      name: { en: "Ping & Jitter Monitor", bn: "ইন্টারনেট পিং ও জিটার মনিটর" },
      desc: { en: "Track live network latency, spikes & stability for gaming and remote calls.", bn: "অনলাইন গেমিং ও ভিডিও কলের জন্য ইন্টারনেটের পিং ও স্থিরতা পরীক্ষা করুন।" },
      guide: { en: "Start the live monitor to measure 20 consecutive pulses with min/avg/max jitter.", bn: "স্টার্ট বাটনে ক্লিক করে টানা ২০টি সিগন্যালে নেটওয়ার্কের পিং ও স্পাইক দেখুন।" },
      faqs: [{ q: "What jitter is ideal for gaming?", a: "Under 10ms jitter ensures lag-free voice and gameplay." }]
    },
    {
      id: "temp-mail", category: "security", icon: "mail-check", badge: "Instant Inbox", scorecard: false,
      name: { en: "Disposable Temp Mail", bn: "টেম্পোরারি ইমেইল (Temp Mail)" },
      desc: { en: "Generate an instant anonymous email inbox to receive OTPs without spam.", bn: "স্প্যাম এড়াতে তাৎক্ষণিক অস্থায়ী ইমেইল তৈরি করুন ও ইনবক্সে ওটিপি রিসিভ করুন।" },
      guide: { en: "Copy your temporary address and keep this tab open—new emails arrive automatically.", bn: "তৈরি হওয়া ইমেইলটি কপি করে ব্যবহার করুন—ইনবক্স অটোমেটিক রিফ্রেশ হবে।" },
      faqs: [{ q: "How long does the inbox stay active?", a: "Active during your session; Pro users can keep custom domain inboxes longer." }]
    },
    {
      id: "scam-link-checker", category: "security", icon: "shield-ban", badge: "Anti-Phishing", scorecard: false,
      name: { en: "Scam Link & URL Expander", bn: "স্ক্যাম লিংক ও শর্ট URL চেকার" },
      desc: { en: "Detect phishing patterns & reveal hidden destinations behind shortened links.", bn: "অপরিচিত বা শর্ট লিংকে ক্লিক না করেই সেটি আসল না ফিশিং স্ক্যাম তা যাচাই করুন।" },
      guide: { en: "Paste any suspicious WhatsApp, SMS, or email URL to inspect its safety score.", bn: "সন্দেহজনক লিংক পেস্ট করুন—ক্লিক না করেই আসল গন্তব্য ও রিস্ক দেখতে পাবেন।" },
      faqs: [{ q: "What patterns indicate a scam link?", a: "Punycode lookalikes, IP-based URLs, mismatched brand subdomains, and risky TLDs." }]
    },
    {
      id: "password-gmail-alias", category: "security", icon: "key-round", badge: "2-in-1", scorecard: false,
      name: { en: "Password & Gmail Alias Tool", bn: "পাসওয়ার্ড ও জিমেইল অ্যালিয়াস টুল" },
      desc: { en: "Generate uncrackable passwords with crack-time score + unlimited Gmail aliases.", bn: "শক্তিশালী পাসওয়ার্ড বানান এবং একটি জিমেইল থেকে অসংখ্য অ্যালিয়াস ইমেইল তৈরি করুন।" },
      guide: { en: "Switch tabs between Password Generator and Gmail Dot/Plus Alias Maker.", bn: "পাসওয়ার্ড জেনারেটর অথবা জিমেইল অ্যালিয়াস ট্যাব বেছে নিয়ে ব্যবহার করুন।" },
      faqs: [{ q: "Are Gmail aliases safe?", a: "Yes, all mail still goes to your real inbox while letting you filter spam." }]
    }
  ]
};
