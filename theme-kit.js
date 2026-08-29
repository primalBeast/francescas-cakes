(function () {
  const KEY = "francesca-look";
  const DEFAULTS = {
    design: "cream",
    palette: "cream-cocoa",
    corners: "soft",
    type: "serif",
    density: "comfy",
    photos: "airy",
    buttons: "filled",
    logo: "wordmark"
  };

  const FIELDS = {
    design: "look-design",
    palette: "look-palette",
    corners: "look-corners",
    type: "look-type",
    density: "look-density",
    photos: "look-photos",
    buttons: "look-buttons",
    logo: "look-logo"
  };

  const ATTR = {
    design: "theme",
    palette: "palette",
    corners: "corners",
    type: "type",
    density: "density",
    photos: "photos",
    buttons: "buttons",
    logo: "logo"
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...(parsed && typeof parsed === "object" ? parsed : {}) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function save(look) {
    localStorage.setItem(KEY, JSON.stringify(look));
  }

  function currentFromSelects() {
    const look = { ...DEFAULTS };
    for (const key of Object.keys(FIELDS)) {
      const el = document.getElementById(FIELDS[key]);
      if (el && el.value) look[key] = el.value;
    }
    return look;
  }

  function applyAttributes(look) {
    const html = document.documentElement;
    for (const key of Object.keys(ATTR)) {
      html.setAttribute("data-" + ATTR[key], look[key]);
    }
  }

  function syncSelects(look) {
    for (const key of Object.keys(FIELDS)) {
      const el = document.getElementById(FIELDS[key]);
      if (el) el.value = look[key];
    }
  }

  function logoSrc(id) {
    return "images/logos/logo-" + id + ".png";
  }

  function setImg(img, src) {
    if (!img) return;
    img.hidden = true;
    img.removeAttribute("src");
    img.alt = "";
    if (!src) return;
    img.onload = function () { img.hidden = false; };
    img.onerror = function () {
      img.hidden = true;
      img.removeAttribute("src");
    };
    img.src = src;
  }

  function applyLogo(id) {
    const brand = document.getElementById("brand-logo");
    const preview = document.getElementById("look-logo-preview");
    if (!id || id === "wordmark") {
      setImg(brand, null);
      setImg(preview, null);
      return;
    }
    const src = logoSrc(id);
    setImg(brand, src);
    setImg(preview, src);
  }

  function syncBarHeight() {
    const bar = document.getElementById("look-bar");
    if (!bar) return;
    document.documentElement.style.setProperty("--look-bar-h", bar.offsetHeight + "px");
  }

  function apply(look) {
    applyAttributes(look);
    syncSelects(look);
    applyLogo(look.logo);
    save(look);
    syncBarHeight();
  }

  function fillLogoSelect() {
    const sel = document.getElementById("look-logo");
    if (!sel) return;
    const opts = ['<option value="wordmark">Wordmark only</option>'];
    for (let i = 1; i <= 29; i++) {
      const id = String(i).padStart(2, "0");
      opts.push('<option value="' + id + '">Logo ' + id + "</option>");
    }
    sel.innerHTML = opts.join("");
  }

  fillLogoSelect();

  let look = load();
  apply(look);

  for (const key of Object.keys(FIELDS)) {
    const el = document.getElementById(FIELDS[key]);
    if (!el) continue;
    el.addEventListener("change", function () {
      look = currentFromSelects();
      apply(look);
    });
  }

  const copyBtn = document.getElementById("copy-look");
  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      const text = JSON.stringify(look, null, 2);
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      copyBtn.textContent = "Copied";
      copyBtn.classList.add("is-copied");
      setTimeout(function () {
        copyBtn.textContent = "Copy look";
        copyBtn.classList.remove("is-copied");
      }, 1400);
    });
  }

  if (window.ResizeObserver) {
    const bar = document.getElementById("look-bar");
    if (bar) new ResizeObserver(syncBarHeight).observe(bar);
  }
  window.addEventListener("resize", syncBarHeight);
})();
