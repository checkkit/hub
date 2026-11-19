window.TOOL_HANDLERS = window.TOOL_HANDLERS || {};

window.TOOL_HANDLERS["exif-remover"] = function (container, api) {
  const isBn = api.lang === "bn";
  const T = {
    dropTitle: isBn ? "ছবি এখানে ড্র্যাগ করুন অথবা ক্লিক করে সিলেক্ট করুন" : "Drop a photo here or click to select",
    dropSub: isBn ? "JPG, PNG, WebP • ১০০% আপনার ব্রাউজারেই প্রসেস হবে (সার্ভারে আপলোড হয় না)" : "JPG, PNG, WebP • 100% processed locally in your browser (Zero upload)",
    metaTitle: isBn ? "ছবির ভেতর পাওয়া গোপন তথ্য (EXIF & GPS)" : "Detected Hidden Metadata (EXIF & GPS)",
    cleanBtn: isBn ? "সব মেটাডেটা মুছে নিরাপদ ছবি ডাউনলোড করুন" : "Strip All Metadata & Download Clean Photo",
    anotherBtn: isBn ? "অন্য ছবি চেক করুন" : "Test Another Photo",
    qualityLabel: isBn ? "আউটপুট কোয়ালিটি" : "Export Quality",
    noExif: isBn ? "এই ছবিতে কোনো সংবেদনশীল EXIF/GPS ডেটা পাওয়া যায়নি — তবুও আপনি চাইলে নতুন ক্লিন কপি সেভ করতে পারেন।" : "No hidden EXIF/GPS tags found in this image — you can still export a freshly re-encoded clean copy.",
    gpsFound: isBn ? "সতর্কতা: ছবিতে আসল GPS লোকেশন পাওয়া গেছে!" : "Warning: Exact GPS Location Found Inside Photo!",
    viewMap: isBn ? "ম্যাপে লোকেশন দেখুন ↗" : "Inspect GPS on Map ↗",
    cleanedDone: isBn ? "সফল! সমস্ত EXIF, ক্যামেরা ও GPS তথ্য স্থায়ীভাবে মুছে ডাউনলোড হয়েছে।" : "Done! All EXIF, camera, and GPS data permanently wiped."
  };

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Upload Dropzone -->
      <label id="exif-dropzone" class="block cursor-pointer rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-emerald-400 bg-slate-100/70 dark:bg-white/[0.03] p-8 text-center transition">
        <input id="exif-file-input" type="file" accept="image/*" class="hidden" />
        <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <i data-lucide="image-plus" class="w-7 h-7"></i>
        </div>
        <h3 class="text-sm sm:text-base font-extrabold mb-1">${T.dropTitle}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">${T.dropSub}</p>
      </label>

      <!-- Workspace Results Panel -->
      <div id="exif-workspace" class="hidden space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <!-- Image Preview & File Info -->
          <div class="md:col-span-5 p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
            <img id="exif-preview-img" src="" alt="Preview" class="w-full h-48 object-contain rounded-xl bg-slate-950" />
            <div class="space-y-1 text-xs">
              <div class="font-extrabold truncate" id="exif-file-name">—</div>
              <div class="flex justify-between text-slate-500 dark:text-slate-400">
                <span id="exif-dims">—</span>
                <span id="exif-size" class="font-mono font-bold text-cyan-500">—</span>
              </div>
            </div>
            <button id="exif-reset-btn" class="btn-glass w-full py-2 rounded-xl text-xs font-bold">${T.anotherBtn}</button>
          </div>

          <!-- Detected Metadata Inspector -->
          <div class="md:col-span-7 p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-xs sm:text-sm font-extrabold flex items-center gap-2">
                <i data-lucide="file-search" class="w-4 h-4 text-fuchsia-400"></i> ${T.metaTitle}
              </h4>
              <span id="exif-risk-pill" class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">—</span>
            </div>

            <!-- GPS Alert Banner -->
            <div id="exif-gps-alert" class="hidden p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs space-y-1.5">
              <div class="font-extrabold text-rose-400 flex items-center gap-1.5">
                <i data-lucide="map-pin" class="w-4 h-4"></i> ${T.gpsFound}
              </div>
              <div class="flex items-center justify-between gap-2">
                <span id="exif-gps-coords" class="font-mono text-rose-300 font-bold"></span>
                <a id="exif-gps-link" href="#" target="_blank" rel="noopener" class="font-extrabold text-cyan-400 hover:underline">${T.viewMap}</a>
              </div>
            </div>

            <div id="exif-tags-list" class="space-y-1.5 max-h-56 overflow-y-auto text-xs"></div>
          </div>
        </div>

        <!-- Export Controls & Strip CTA -->
        <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0b1630] to-slate-900 border border-emerald-500/30 text-white space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <div class="flex justify-between text-xs font-bold mb-1">
                <span class="text-slate-300">${T.qualityLabel}</span>
                <span id="exif-qual-val" class="text-emerald-400">92%</span>
              </div>
              <input id="exif-qual-slider" type="range" min="60" max="100" value="92" class="w-full accent-emerald-400 cursor-pointer" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-400">Format:</span>
              <select id="exif-format-select" class="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 border border-white/15 text-white focus:outline-none">
                <option value="image/jpeg" class="text-slate-900">JPEG (Smallest & Clean)</option>
                <option value="image/png" class="text-slate-900">PNG (Lossless & Clean)</option>
                <option value="image/webp" class="text-slate-900">WebP (Modern & Clean)</option>
              </select>
            </div>
          </div>

          <button id="exif-strip-btn" class="btn-gradient-emerald btn-shimmer w-full py-3.5 px-5 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-xl flex items-center justify-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4"></i> <span>${T.cleanBtn}</span>
          </button>

          <div id="exif-done-msg" class="hidden text-center text-xs font-extrabold text-emerald-400"></div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // -------- PURE JS BINARY JPEG EXIF & GPS PARSER --------
  function readAscii(view, start, len) {
    let out = "";
    for (let i = 0; i < len && start + i < view.byteLength; i++) {
      const code = view.getUint8(start + i);
      if (code === 0) break;
      out += String.fromCharCode(code);
    }
    return out.trim();
  }

  function readRational(view, offset, little) {
    if (offset + 8 > view.byteLength) return 0;
    const num = view.getUint32(offset, little);
    const den = view.getUint32(offset + 4, little);
    return den ? num / den : 0;
  }

  function parseExifFromBuffer(buffer) {
    const view = new DataView(buffer);
    const tags = {};
    let gps = null;

    if (view.byteLength < 12 || view.getUint16(0, false) !== 0xffd8) {
      return { tags, gps, hasExifHeader: false };
    }

    let offset = 2;
    while (offset + 4 < view.byteLength) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffe1) {
        const segLen = view.getUint16(offset, false);
        if (readAscii(view, offset + 2, 4) === "Exif") {
          const tiffStart = offset + 8;
          if (tiffStart + 8 >= view.byteLength) break;
          const little = view.getUint16(tiffStart, false) === 0x4949;
          const firstIfdOffset = view.getUint32(tiffStart + 4, little);

          const tagNames = {
            0x010f: "Camera Make",
            0x0110: "Camera Model",
            0x0112: "Orientation",
            0x0131: "Software",
            0x0132: "Date Modified",
            0x9003: "Date Taken",
            0xa434: "Lens Model",
            0x829a: "Exposure Time",
            0x8827: "ISO Speed"
          };

          const readIfd = (ifdPos) => {
            if (ifdPos + 2 > view.byteLength) return {};
            const entries = view.getUint16(ifdPos, little);
            const raw = {};
            for (let i = 0; i < entries; i++) {
              const entryOffset = ifdPos + 2 + i * 12;
              if (entryOffset + 12 > view.byteLength) break;
              const tagId = view.getUint16(entryOffset, little);
              const type = view.getUint16(entryOffset + 2, little);
              const count = view.getUint32(entryOffset + 4, little);
              const valOffsetField = entryOffset + 8;

              if (type === 2) {
                const strStart = count > 4 ? tiffStart + view.getUint32(valOffsetField, little) : valOffsetField;
                raw[tagId] = readAscii(view, strStart, count);
              } else if (type === 3) {
                raw[tagId] = view.getUint16(valOffsetField, little);
              } else if (type === 4) {
                raw[tagId] = view.getUint32(valOffsetField, little);
              } else if (type === 5) {
                const rStart = tiffStart + view.getUint32(valOffsetField, little);
                if (count === 1) {
                  raw[tagId] = readRational(view, rStart, little);
                } else {
                  const arr = [];
                  for (let k = 0; k < count; k++) arr.push(readRational(view, rStart + k * 8, little));
                  raw[tagId] = arr;
                }
              }
            }
            return raw;
          };

          const ifd0 = readIfd(tiffStart + firstIfdOffset);
          Object.keys(ifd0).forEach((k) => {
            if (tagNames[k] && ifd0[k]) tags[tagNames[k]] = String(ifd0[k]);
          });

          if (ifd0[0x8769]) {
            const exifIfd = readIfd(tiffStart + ifd0[0x8769]);
            Object.keys(exifIfd).forEach((k) => {
              if (tagNames[k] && exifIfd[k]) tags[tagNames[k]] = String(exifIfd[k]);
            });
          }

          if (ifd0[0x8825]) {
            const gpsIfd = readIfd(tiffStart + ifd0[0x8825]);
            if (Array.isArray(gpsIfd[2]) && Array.isArray(gpsIfd[4])) {
              let lat = gpsIfd[2][0] + gpsIfd[2][1] / 60 + gpsIfd[2][2] / 3600;
              let lng = gpsIfd[4][0] + gpsIfd[4][1] / 60 + gpsIfd[4][2] / 3600;
              if (gpsIfd[1] === "S") lat = -lat;
              if (gpsIfd[3] === "W") lng = -lng;
              if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                gps = { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
                tags["GPS Coordinates"] = `${gps.lat}, ${gps.lng}`;
              }
            }
          }
          return { tags, gps, hasExifHeader: true };
        }
        offset += segLen;
      } else if ((marker & 0xff00) !== 0xff00) {
        break;
      } else {
        const size = view.getUint16(offset, false);
        offset += size;
      }
    }
    return { tags, gps, hasExifHeader: false };
  }

  function formatBytes(b) {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  }

  let loadedImg = null;
  let originalFileName = "photo";

  const dropzone = container.querySelector("#exif-dropzone");
  const fileInput = container.querySelector("#exif-file-input");
  const workspace = container.querySelector("#exif-workspace");
  const previewImg = container.querySelector("#exif-preview-img");
  const fileNameEl = container.querySelector("#exif-file-name");
  const dimsEl = container.querySelector("#exif-dims");
  const sizeEl = container.querySelector("#exif-size");
  const riskPill = container.querySelector("#exif-risk-pill");
  const gpsAlert = container.querySelector("#exif-gps-alert");
  const gpsCoords = container.querySelector("#exif-gps-coords");
  const gpsLink = container.querySelector("#exif-gps-link");
  const tagsList = container.querySelector("#exif-tags-list");
  const qualSlider = container.querySelector("#exif-qual-slider");
  const qualVal = container.querySelector("#exif-qual-val");
  const formatSelect = container.querySelector("#exif-format-select");
  const doneMsg = container.querySelector("#exif-done-msg");

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    originalFileName = file.name.replace(/\.[^/.]+$/, "");
    fileNameEl.textContent = file.name;
    sizeEl.textContent = formatBytes(file.size);
    doneMsg.classList.add("hidden");

    const readerBuf = new FileReader();
    readerBuf.onload = (e) => {
      const { tags, gps, hasExifHeader } = parseExifFromBuffer(e.target.result);
      const entries = Object.entries(tags);

      if (gps) {
        gpsAlert.classList.remove("hidden");
        gpsCoords.textContent = `${gps.lat}, ${gps.lng}`;
        gpsLink.href = `https://www.google.com/maps?q=${gps.lat},${gps.lng}`;
        riskPill.textContent = "GPS EXPOSED";
        riskPill.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400";
      } else if (entries.length > 0 || hasExifHeader) {
        gpsAlert.classList.add("hidden");
        riskPill.textContent = `${entries.length || "EXIF"} TAGS FOUND`;
        riskPill.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400";
      } else {
        gpsAlert.classList.add("hidden");
        riskPill.textContent = "NO EXIF FOUND";
        riskPill.className = "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400";
      }

      if (entries.length > 0) {
        tagsList.innerHTML = entries
          .map(
            ([k, v]) => `
            <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-100/80 dark:bg-white/5">
              <span class="font-semibold text-slate-500 dark:text-slate-400">${k}</span>
              <strong class="font-mono text-right truncate">${v}</strong>
            </div>`
          )
          .join("");
      } else {
        tagsList.innerHTML = `<p class="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 font-semibold">${T.noExif}</p>`;
      }
    };
    readerBuf.readAsArrayBuffer(file);

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      loadedImg = img;
      previewImg.src = url;
      dimsEl.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
      dropzone.classList.add("hidden");
      workspace.classList.remove("hidden");
    };
    img.src = url;
  }

  fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("border-emerald-400", "bg-emerald-500/10");
  });
  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("border-emerald-400", "bg-emerald-500/10");
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("border-emerald-400", "bg-emerald-500/10");
    handleFile(e.dataTransfer.files[0]);
  });

  qualSlider.addEventListener("input", () => {
    qualVal.textContent = `${qualSlider.value}%`;
  });

  container.querySelector("#exif-reset-btn").addEventListener("click", () => {
    fileInput.value = "";
    loadedImg = null;
    workspace.classList.add("hidden");
    dropzone.classList.remove("hidden");
  });

  // Strip Metadata via HTML5 Canvas Re-Encoding
  container.querySelector("#exif-strip-btn").addEventListener("click", () => {
    if (!loadedImg) return;
    const canvas = document.createElement("canvas");
    canvas.width = loadedImg.naturalWidth;
    canvas.height = loadedImg.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(loadedImg, 0, 0);

    const mime = formatSelect.value;
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const quality = Number(qualSlider.value) / 100;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const cleanUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = cleanUrl;
        a.download = `${originalFileName}-clean.${ext}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(cleanUrl), 3000);

        doneMsg.textContent = `${T.cleanedDone} (${formatBytes(blob.size)})`;
        doneMsg.classList.remove("hidden");
      },
      mime,
      quality
    );
  });
};