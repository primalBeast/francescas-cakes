const FLAVORS = [
  { id: "vanilla", name: "Vanilla bean", blurb: "Speckled cake, smooth American buttercream.", allergens: "egg, milk, wheat", photo: "images/vanilla.jpg" },
  { id: "chocolate", name: "Dark chocolate", blurb: "Deep cocoa, same buttercream.", allergens: "egg, milk, wheat, soy", photo: "images/chocolate.jpg" },
  { id: "lemon", name: "Lemon with raspberry jam", blurb: "Lemon cake, cooked raspberry jam.", allergens: "egg, milk, wheat", photo: "images/lemon.jpg" }
];
const SIZES = [
  { id: "6", name: "6 inch", feeds: "8–10 slices", price: 75 },
  { id: "8", name: "8 inch", feeds: "12–16 slices", price: 115 }
];
const FINISHES = [
  { id: "plain", name: "Plain", blurb: "Smooth round, no extra icing story.", photo: "images/069-drip.jpg" },
  { id: "birthday", name: "Birthday", blurb: "Same cake, festive finish.", photo: "images/058-chocolate-birthday.jpg" },
  { id: "halloween", name: "Halloween", blurb: "Same cake, themed icing.", photo: "images/halloween.jpg" },
  { id: "fruit", name: "Pretend Fruit", blurb: "Piped or modeled fruit. Never fresh fruit.", photo: "images/208-peach-roses.jpg" }
];

const state = { flavor: null, size: null, finish: null, date: null, account: null };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function money(n) { return `$${n}`; }

function collectionDates() {
  const out = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 2);
  for (let i = 0; i < 28 && out.length < 8; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const day = d.getDay();
    if (day === 5 || day === 6 || day === 0) out.push(d);
  }
  return out;
}

function fmtDate(d) {
  return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function currentPrice() {
  const size = SIZES.find((s) => s.id === state.size);
  return size ? size.price : 0;
}

function renderChoices() {
  const box = $("#choices");
  const step = stepIndex();
  $("#step-flavor").classList.toggle("on", step === 1);
  $("#step-size").classList.toggle("on", step === 2);
  $("#step-finish").classList.toggle("on", step === 3);
  $("#back-btn").hidden = step === 1 && !state.flavor;

  if (step === 1) {
    box.className = "choice-grid";
    box.innerHTML = FLAVORS.map((f) => choiceBtn(f.id, f.name, f.blurb, state.flavor === f.id, f.photo)).join("");
    box.querySelectorAll(".choice").forEach((btn) => btn.addEventListener("click", () => {
      state.flavor = btn.dataset.id;
      renderAll();
    }));
  } else if (step === 2) {
    box.className = "choice-grid sizes";
    box.innerHTML = SIZES.map((s) => choiceBtn(s.id, s.name, `${s.feeds} · ${money(s.price)}`, state.size === s.id)).join("");
    box.querySelectorAll(".choice").forEach((btn) => btn.addEventListener("click", () => {
      state.size = btn.dataset.id;
      renderAll();
    }));
  } else {
    box.className = "choice-grid";
    box.innerHTML = FINISHES.map((f) => choiceBtn(f.id, f.name, f.blurb, state.finish === f.id, f.photo)).join("");
    box.querySelectorAll(".choice").forEach((btn) => btn.addEventListener("click", () => {
      state.finish = btn.dataset.id;
      renderAll();
    }));
  }
  if (typeof loadB64Images === "function") loadB64Images(box);
}

function choiceBtn(id, name, blurb, on, photo) {
  const img = photo ? `<img src="${photo}" alt="" />` : "";
  return `<button class="choice ${on ? "selected" : ""}" type="button" data-id="${id}">${img}<span class="choice-copy"><b>${name}</b><small>${blurb}</small></span></button>`;
}

function stepIndex() {
  if (!state.flavor) return 1;
  if (!state.size) return 2;
  return 3;
}

function renderSummary() {
  const flavor = FLAVORS.find((f) => f.id === state.flavor);
  const size = SIZES.find((s) => s.id === state.size);
  const finish = FINISHES.find((f) => f.id === state.finish);
  $("#price").textContent = size ? money(size.price) : "$0";
  $("#summary-line").textContent = [flavor?.name, size ? `${size.name} · ${money(size.price)}` : null, finish?.name]
    .filter(Boolean)
    .join(" · ") || "Pick a flavor to start.";
  $("#allergen-line").textContent = flavor ? `Allergens: ${flavor.allergens}` : "Every cake: egg, milk, wheat.";
  $("#continue-btn").disabled = !(state.flavor && state.size && state.finish);
}

function fillDates() {
  const sel = $("#pickup-date");
  const dates = collectionDates();
  sel.innerHTML = `<option value="">Choose a collection day</option>` + dates.map((d) =>
    `<option value="${isoDate(d)}">${fmtDate(d)}</option>`
  ).join("");
}

function show(id) {
  $$(".stage").forEach((el) => { el.hidden = el.id !== id; });
}

function savedAccount() {
  try { return JSON.parse(localStorage.getItem("francesca-account") || "null"); }
  catch { return null; }
}

function renderAll() {
  renderChoices();
  renderSummary();
}

function startOrder(finishHint) {
  show("stage-order");
  $("#order").scrollIntoView({ behavior: "smooth", block: "start" });
  renderAll();
  if (finishHint) {
    const btn = document.querySelector(`#choices [data-id="${finishHint}"]`);
    // Finish is tap 3; just remember the hint for later highlight.
    startOrder.hint = finishHint;
  }
}

function bind() {
  $("#continue-btn").addEventListener("click", () => {
    if (!(state.flavor && state.size && state.finish)) return;
    show("stage-date");
  });
  $("#back-btn").addEventListener("click", () => {
    const stage = $$(".stage").find((el) => !el.hidden)?.id;
    if (stage === "stage-date") { show("stage-order"); return; }
    if (stage === "stage-account") { show("stage-date"); return; }
    if (stage === "stage-pay") { show("stage-account"); return; }
    if (state.finish) state.finish = null;
    else if (state.size) state.size = null;
    else state.flavor = null;
    renderAll();
  });
  $("#stage-date").addEventListener("submit", (e) => {
    e.preventDefault();
    state.date = $("#pickup-date").value;
    if (!state.date) return;
    const acct = savedAccount();
    if (acct) {
      state.account = acct;
      $("#hello-name").textContent = acct.name;
      show("stage-pay");
    } else {
      show("stage-account");
    }
  });
  $("#stage-account").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#cust-name").value.trim();
    const email = $("#cust-email").value.trim();
    if (!name || !email) return;
    state.account = { name, email };
    localStorage.setItem("francesca-account", JSON.stringify(state.account));
    $("#hello-name").textContent = name;
    show("stage-pay");
  });
  $("#stage-pay").addEventListener("submit", (e) => {
    e.preventDefault();
    const num = $("#card-number").value.replace(/\s+/g, "");
    const exp = $("#card-exp").value.trim();
    const cvc = $("#card-cvc").value.trim();
    const err = $("#pay-error");
    if (!/^\d{16}$/.test(num) || !/^\d{2}\/\d{2}$/.test(exp) || !/^\d{3}$/.test(cvc)) {
      err.hidden = false;
      err.textContent = "Use 16 digits, MM/YY, and a 3-digit CVC. Nothing is charged.";
      return;
    }
    err.hidden = true;
    const flavor = FLAVORS.find((f) => f.id === state.flavor);
    const size = SIZES.find((s) => s.id === state.size);
    const finish = FINISHES.find((f) => f.id === state.finish);
    $("#conf-body").innerHTML = `
      <p>Thanks, ${state.account.name}. Your cake is on the next bake list.</p>
      <p><strong>${finish.name} ${flavor.name}</strong><br>${size.name} · ${money(size.price)} · collect ${state.date}</p>
      <p class="muted">Pickup details come with a real order. This shop is a preview — no charge was taken.</p>
    `;
    show("stage-done");
  });
  $("#card-number").addEventListener("input", (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  });
  $$("[data-start]").forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    startOrder(el.dataset.start || null);
  }));
  $("#new-order").addEventListener("click", () => {
    state.flavor = state.size = state.finish = state.date = null;
    show("stage-order");
    renderAll();
  });
}

fillDates();
bind();
renderAll();
