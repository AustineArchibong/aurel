// ====== EDIT THESE FOR EACH DROP ======
const CONFIG = {
  price: 15000,                              // Naira per shirt
  opens: "2026-10-04T00:00:00+01:00",        // drop opens (Nigeria time, +01:00)
  closes: "2026-10-25T23:59:00+01:00",       // drop closes (the database value is what actually counts)
  cap: 50,                                   // total pieces for this drop
  sold: 0,                                   // update by hand as orders come in
  eta: "3 to 4 weeks after the drop closes",
  whatsapp: "2347032404818",                 // 07032404818 in international format
  bank: "Moniepoint",
  acctNo: "7070856600",
  acctName: "Austine Utibe Archibong"        // CHECK: must match your account name exactly
};
// ======================================

const $ = id => document.getElementById(id);
const naira = n => "₦" + n.toLocaleString();
let opens = new Date(CONFIG.opens), closes = new Date(CONFIG.closes);
let state = "";

$("price").textContent = naira(CONFIG.price);
$("faqEta").textContent = "Your order is made after the drop closes and arrives in " + CONFIG.eta + ".";
$("notify").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hi AUREL, notify me when the next drop opens.")}`;

// floating camo specks behind the shirt
const cols = ["#2f5d1f", "#5a3b1c", "#c9b27a", "#161a10", "#4b7a2a"];
for (let i = 0; i < 16; i++) {
  const s = document.createElement("i"), z = 8 + Math.random() * 26;
  s.className = "speck";
  s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${z}px;height:${z*.8}px;background:${cols[i%5]};--x:${(Math.random()-.5)*60}px;--y:${(Math.random()-.5)*60}px;--r:${Math.random()*180}deg;--t:${4+Math.random()*5}s;animation-delay:-${Math.random()*5}s`;
  $("specks").appendChild(s);
}

// 3D shirt: hover/touch tilt, drag to spin, tap to flip, intro spin
const card = $("card");
let base = 0, rx = 0, ry = 0, down = false, startX = 0, startBase = 0, moved = 0;
const draw = () => card.style.transform = `rotateX(${rx}deg) rotateY(${base + ry}deg)`;
setTimeout(() => { base = 720; draw(); }, 2000);            // intro spin after the logo screen
card.addEventListener("pointerdown", e => {
  down = true; moved = 0; startX = e.clientX; startBase = base; ry = 0;
  card.classList.add("drag"); card.setPointerCapture(e.pointerId);
});
card.addEventListener("pointermove", e => {
  const r = card.getBoundingClientRect();
  if (down) {
    moved = Math.abs(e.clientX - startX);
    base = startBase + (e.clientX - startX) * 0.6;
  } else if (e.pointerType === "mouse") {
    ry = ((e.clientX - r.left) / r.width - .5) * 24;
    rx = -((e.clientY - r.top) / r.height - .5) * 16;
  }
  draw();
});
const release = () => {
  if (!down) return; down = false; card.classList.remove("drag");
  base = moved < 6 ? Math.round(base / 180) * 180 + 180       // tap = flip
                   : Math.round(base / 180) * 180;            // drag = snap to a side
  rx = 0; ry = 0; draw();
};
card.addEventListener("pointerup", release);
card.addEventListener("pointercancel", release);
card.addEventListener("pointerleave", () => { if (!down) { rx = 0; ry = 0; draw(); } });

// pieces left + progress bar (numbers come from the database)
let left = Math.max(CONFIG.cap - CONFIG.sold, 0);
function applyDrop() {
  opens = new Date(CONFIG.opens); closes = new Date(CONFIG.closes);
  left = Math.max(CONFIG.cap - CONFIG.sold, 0);
  $("price").textContent = naira(CONFIG.price); updateTotal();
  $("left").textContent = left > 0 ? `${left} of ${CONFIG.cap} pieces left` : "Sold out";
  $("bar").style.width = (CONFIG.sold / CONFIG.cap * 100) + "%";
}

// countdown + open/closed logic
function tick(){
  const now = new Date();
  let target, label;
  if (now < opens){ state = "soon"; target = opens; label = "Drop opens in"; }
  else if (now < closes && left > 0){ state = "live"; target = closes; label = "Drop closes in"; }
  else { state = "closed"; target = now; label = ""; }
  const t = Math.max(target - now, 0);
  const p = (n, l = 2) => String(n).padStart(l, "0");
  $("d").textContent = p(Math.floor(t / 864e5));
  $("h").textContent = p(Math.floor(t % 864e5 / 36e5));
  $("m").textContent = p(Math.floor(t % 36e5 / 6e4));
  $("s").textContent = p(Math.floor(t % 6e4 / 1e3));
  $("countLabel").textContent = label;
  const open = state === "live";
  $("form").hidden = !open && state !== "soon" ? true : false;
  $("closed").hidden = state !== "closed";
  $("btn").disabled = state === "soon";
  $("btn").textContent = state === "soon" ? "Drop not open yet" : "Pre-order now";
  const s = $("status");
  s.textContent = open ? "● LIVE" : state === "soon" ? "COMING SOON" : "CLOSED";
  s.className = "pill " + (open ? "live" : state === "soon" ? "" : "off");
}
tick(); setInterval(tick, 1000);

// total
const updateTotal = () => $("total").textContent = naira(CONFIG.price * (+$("qty").value || 1));
$("qty").oninput = updateTotal; updateTotal();

// colour switcher: the shirt spins, flashes and swaps to the chosen colour
let color = "white";
const SRC = c => ({ f: c === "white" ? "front.png" : `front_${c}.png`, b: c === "white" ? "back.png" : `back_${c}.png` });
["white", "black"].forEach(c => { const s = SRC(c); new Image().src = s.f; new Image().src = s.b; });   // preload
document.querySelectorAll(".sw").forEach(btn => btn.onclick = () => {
  const c = btn.dataset.c; if (c === color) return; color = c;
  document.querySelectorAll(".sw").forEach(x => x.classList.toggle("on", x === btn));
  $("colorName").textContent = c[0].toUpperCase() + c.slice(1);
  const stage = $("stage"), imgs = document.querySelectorAll(".face img"), s = SRC(c);
  stage.classList.remove("ring"); void stage.offsetWidth; stage.classList.add("ring");
  base += 360; draw();                                            // one full spin
  setTimeout(() => {
    imgs.forEach(i => { i.classList.remove("flash"); void i.offsetWidth; i.classList.add("flash"); });
    imgs[0].src = s.f; imgs[1].src = s.b;
    card.style.setProperty("--f", `url(${s.f})`); card.style.setProperty("--b", `url(${s.b})`);
  }, 450);
});

// order -> saved in database -> bank transfer sheet -> tracking page
let order = null;
const toast = m => { const t = $("toast"); t.textContent = m; t.hidden = false; setTimeout(() => t.hidden = true, 4000); };
$("form").onsubmit = async e => {
  e.preventDefault();
  if (state !== "live") return;
  const btn = $("btn"); btn.disabled = true; btn.textContent = "Placing your order…";
  const qty = Math.min(Math.max(+$("qty").value || 1, 1), 5);
  const size = document.querySelector("input[name=size]:checked").value;
  try {
    const r = (await db.rpc("create_order", {
      p_drop: "drop-001", p_name: $("name").value, p_phone: $("phone").value,
      p_address: $("addr").value, p_size: size, p_qty: qty, p_color: color
    }))[0];
    order = { ref: r.ref, total: r.total, phone: $("phone").value.trim() };
    $("sum").textContent = `${color[0].toUpperCase() + color.slice(1)} tee · Size ${size} · Qty ${qty}`;
    $("ref").textContent = r.ref; $("amt").textContent = naira(r.total);
    $("bank").textContent = CONFIG.bank; $("acctNo").textContent = CONFIG.acctNo; $("acctName").textContent = CONFIG.acctName;
    try { sessionStorage.setItem("aurel_track", JSON.stringify({ ref: r.ref, phone: order.phone })); } catch (_) {}
    $("wa").href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent("Hi AUREL, I need help with my order " + r.ref);
    $("pay").hidden = false;
    loadDrop();
  } catch (err) { toast(err.message); }
  btn.disabled = false; btn.textContent = "Pre-order now";
};
$("copy").onclick = () => {
  const done = () => { $("copy").textContent = "Copied ✓"; setTimeout(() => $("copy").textContent = "Copy account number", 2000); };
  navigator.clipboard ? navigator.clipboard.writeText(CONFIG.acctNo).then(done, done) : done();
};
$("sent").onclick = () => location.href = "track.html?ref=" + encodeURIComponent(order.ref);
$("payX").onclick = () => $("pay").hidden = true;

// size guide
$("guide").onclick = e => { e.preventDefault(); $("modal").hidden = false; };
$("x").onclick = () => $("modal").hidden = true;
$("modal").onclick = e => { if (e.target.id === "modal") $("modal").hidden = true; };

// scroll reveal
const io = new IntersectionObserver(es => es.forEach(x => x.isIntersecting && x.target.classList.add("show")), { threshold: .1 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// load live drop info (price, window, pieces sold) from the database
function loadDrop() {
  db.rpc("drop_status", { p_drop: "drop-001" }).then(r => {
    const d = r[0]; if (!d) return;
    Object.assign(CONFIG, { price: d.price, cap: d.cap, sold: d.sold, opens: d.opens_at, closes: d.closes_at });
    applyDrop(); tick();
  }).catch(() => {});
}
loadDrop();
