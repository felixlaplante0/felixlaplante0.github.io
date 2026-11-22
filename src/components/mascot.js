import { gsap } from "gsap";

document.addEventListener("astro:page-load", async () => {
  const img = document.querySelector(".mascot img");
  if (!img || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ac = new AbortController();
  const { signal } = ac;
  let animations;
  document.addEventListener("astro:before-swap", () => {
    ac.abort();
    animations?.revert();
  }, { once: true });

  let svg;
  try {
    const response = await fetch(img.src, { signal });
    if (!response.ok) return;
    svg = new DOMParser().parseFromString(await response.text(), "image/svg+xml").documentElement;
  } catch {
    return;
  }
  if (signal.aborted || !img.isConnected || svg.localName !== "svg") return;
  animations = gsap.context((ctx) => animateMascot(svg, img, signal, ctx));
});

function animateMascot(svg, img, signal, ctx) {
  const NS = "http://www.w3.org/2000/svg";
  const $ = (id) => svg.querySelector(`#${id}`);
  const el = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  };
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => $(`path${a + i}`));
  const wrap = (nodes, attrs = {}) => {
    const g = el("g", attrs);
    nodes[0].before(g);
    g.append(...nodes);
    return g;
  };

  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.classList.add("mascot-svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", img.alt || "Zucchini mascot");

  // Each part's outline (#outline-<part>) moves into the part's group.
  const parts = {
    leaf: [$("path52"), $("path53"), $("path55")],
    legR: [$("path26"), ...range(57, 59)],
    armR: range(60, 63),
    legL: range(64, 66),
    armL: range(67, 68),
  };
  const silhouette = $("path2");
  const artwork = $("svg68");
  const outline = $("outline");
  const defs = svg.querySelector("defs");
  const box = { maskUnits: "userSpaceOnUse", x: -100, y: -100, width: 800, height: 1150 };

  // Parts are drawn above the body, so mask their outlines where they overlap it.
  const offBody = (id, band) => {
    const m = el("mask", { id, ...box });
    const inside = silhouette.cloneNode();
    inside.removeAttribute("id");
    inside.setAttribute("fill", "#000");
    inside.setAttribute("stroke", "#000");
    inside.setAttribute("stroke-width", band);
    m.append(el("rect", { x: -100, y: -100, width: 800, height: 1150, fill: "#fff" }), inside);
    defs.append(m);
    return `url(#${id})`;
  };
  const offBodyMask = offBody("zm-off-body", 0);
  const offBodyFeet = offBody("zm-off-body-feet", 16);

  // Fill the notch in the body under the right foot.
  const notch = el("path", {
    d: $("outline-body").lastElementChild.getAttribute("d"),
    fill: "#99d172",
  });
  silhouette.after(notch);

  const clip = (id, paths) => {
    const c = el("clipPath", { id });
    c.append(...paths.map((p) => { const n = p.cloneNode(); n.removeAttribute("id"); return n; }));
    defs.append(c);
    return `url(#${id})`;
  };
  const face = $("face");
  const makeEye = (side) => {
    const eye = wrap([...face.querySelectorAll(`[id^="${side}-"]`)]);
    const glint = wrap([$(`${side}-glint`)]);
    wrap([glint], { "clip-path": clip(`zm-${side}-pupil`, [$(`${side}-pupil`)]) });
    return { eye, glint };
  };
  const { eye: eyeL, glint: glintL } = makeEye("left");
  const { eye: eyeR, glint: glintR } = makeEye("right");

  const groups = {};
  for (const [name, paths] of Object.entries(parts)) {
    groups[name] = wrap(paths);
    const rim = $(`outline-${name}`);
    if (rim) {
      for (const attr of ["fill", "stroke", "stroke-width", "stroke-linejoin"]) {
        rim.setAttribute(attr, outline.getAttribute(attr));
      }
      if (name !== "armL") rim.setAttribute("mask", name.startsWith("leg") ? offBodyFeet : offBodyMask);
      groups[name].prepend(rim);
    }
  }
  const { armL, armR, legL, legR, leaf } = groups;
  // Jumps move an outer wrapper so the sway never has to stop.
  const leafJump = wrap([leaf]);
  // The left foot and arm sit behind the body with a hidden extension, so
  // turning them never opens a gap at the joint.
  legL.children[0].after(el("ellipse", { cx: 196, cy: 828, rx: 24, ry: 22, fill: "#55c775" }));
  armL.children[0].after(el("ellipse", { cx: 162, cy: 542, rx: 34, ry: 32, fill: "#55c775" }));
  const upper = wrap([...artwork.children].filter((n) => ![legR, armR, legL, armL].includes(n)));
  const root = wrap([legL, armL, upper, legR, armR]);
  const shadow = el("ellipse", { cx: 290, cy: 922, rx: 215, ry: 20, fill: "#074e2d", opacity: 0.18 });
  root.before(shadow);
  const arms = [armL, armR];
  const legs = [legL, legR];
  const eyes = [eyeL, eyeR];

  const zzz = el("g", { fill: "#074e2d", "font-family": "sans-serif", "font-weight": "700" });
  const zs = [0, 1, 2].map(() => {
    const t = el("text", { x: 430, y: 330, "font-size": 85, opacity: 0 });
    t.textContent = "z";
    return t;
  });
  zzz.append(...zs);
  svg.append(zzz);

  const sweat = el("g", { fill: "#3fa9f5", stroke: "#074e2d", "stroke-width": 5, "stroke-linejoin": "round" });
  const drops = Array.from({ length: 6 }, () =>
    el("path", { d: "M 0 -22 C 8 -8 13 0 13 8 A 13 13 0 0 1 -13 8 C -13 0 -8 -8 0 -22 Z", opacity: 0 }));
  sweat.append(...drops);
  svg.append(sweat);
  const bang = el("text", { x: 440, y: 310, "font-size": 100, "font-family": "sans-serif", "font-weight": 800, fill: "#074e2d", opacity: 0 });
  bang.textContent = "!";
  svg.append(bang);
  svg.style.overflow = "visible";
  svg.style.userSelect = svg.style.webkitUserSelect = "none";
  for (const layer of [zzz, sweat, bang]) layer.style.pointerEvents = "none";

  img.replaceWith(svg);

  gsap.set(armL, { svgOrigin: "128 525" });
  gsap.set(armR, { svgOrigin: "420 520" });
  gsap.set(legL, { svgOrigin: "190 848" });
  gsap.set(legR, { svgOrigin: "355 848" });
  gsap.set(upper, { svgOrigin: "290 860" });
  gsap.set(root, { svgOrigin: "290 925" });
  gsap.set(eyeL, { transformOrigin: "50% 60%" });
  gsap.set(eyeR, { transformOrigin: "50% 60%" });
  gsap.set([leaf, leafJump], { svgOrigin: "290 206" });
  gsap.set(shadow, { svgOrigin: "290 922" });
  gsap.set(bang, { svgOrigin: "460 260" });

  const leafSway = gsap.fromTo(leaf, { rotation: -5 },
    { rotation: 5, duration: 1.7, repeat: -1, yoyo: true, ease: "sine.inOut" });

  let state = "idle"; // idle | happy | tired | love | sleep | waking

  const idle = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut", duration: 1.8 } })
    .to(upper, { scaleY: 1.012, scaleX: 0.994 }, 0)
    .to(armL, { rotation: 1.5 }, 0)
    .to(armR, { rotation: -1.5 }, 0);

  const blink = () => {
    if (state === "idle") {
      gsap.timeline()
        .to(eyes, { scaleY: 0.1, duration: 0.07, ease: "power1.in" })
        .to(eyes, { scaleY: 1, duration: 0.12, ease: "power1.out" });
    }
    gsap.delayedCall(1.5 + Math.random() * 2.5, blink);
  };
  gsap.delayedCall(1.5, blink);

  // Per-glint rest spot and rightward reach.
  const gaze = [
    { glint: glintL, rest: { x: 0, y: 0 }, right: 1 },
    { glint: glintR, rest: { x: 0, y: 0 }, right: 5 },
  ];
  const toRest = (vars) => gaze.forEach(({ glint, rest }) => gsap.to(glint, { ...rest, ...vars }));
  gaze.forEach(({ glint, rest }) => gsap.set(glint, rest));
  const follow = (e) => {
    if (state === "sleep" || state === "tired" || state === "love") return;
    const ctm = face.getScreenCTM();
    if (!ctm) return;
    const cx = (275 * ctm.a) + ctm.e;
    const cy = (472 * ctm.d) + ctm.f;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // Glints move in a tall ellipse: axes independent inside, clamped at its edge.
    let qx = dx / 250;
    let qy = dy / 250;
    const r = Math.hypot(qx, qy);
    if (r > 1) { qx /= r; qy /= r; }
    for (const { glint, rest, right } of gaze) {
      gsap.to(glint, { x: rest.x + qx * (qx > 0 ? right : 6), y: rest.y + qy * (qy < 0 ? 1 : 8.5),
        duration: 0.25, ease: "power2.out", overwrite: "auto" });
    }
  };

  let happyTl;
  // Clicks in the last 40% of the hops queue a jump for touchdown; earlier ones are ignored.
  const LANDED = 0.78;
  const QUEUE_FROM = LANDED * 0.6;
  let queued = false;
  let wearingOut = false;
  const press = () => {
    if (state === "idle") return happy();
    if (state !== "happy" || wearingOut) return;
    const t = happyTl.time();
    if (t >= LANDED) happy();
    else if (t >= QUEUE_FROM) queued = true;
  };
  const jumps = [];
  const TIRED_JUMPS = 3;
  const TIRED_WINDOW = 3000;
  const happy = () => {
    const now = performance.now();
    jumps.push(now);
    while (now - jumps[0] > TIRED_WINDOW) jumps.shift();
    const worn = jumps.length >= TIRED_JUMPS;
    if (worn) jumps.length = 0;

    state = "happy";
    queued = false;
    wearingOut = worn;
    happyTl?.kill();
    idle.pause();
    const hop = (t, h, up, down) => {
      happyTl
        .to(root, { y: -h, scaleY: 1.04, scaleX: 0.97, duration: up, ease: "power2.out" }, t)
        .to(shadow, { scale: 0.7, opacity: 0.08, duration: up, ease: "power2.out" }, t)
        .to(legL, { rotation: -6, duration: up, ease: "power2.out" }, t)
        .to(legR, { rotation: 6, duration: up, ease: "power2.out" }, t)
        .to(leafJump, { rotation: 4, duration: up, ease: "power1.out" }, t)
        .to(root, { y: 0, scaleY: 0.95, scaleX: 1.03, duration: down, ease: "power2.in" }, t + up)
        .to(shadow, { scale: 1, opacity: 0.18, duration: down, ease: "power2.in" }, t + up)
        .to(legs, { rotation: 0, duration: down, ease: "power2.in" }, t + up)
        .to(leafJump, { rotation: -4, duration: down, ease: "power1.in" }, t + up);
    };
    happyTl = gsap.timeline({ onComplete: worn ? tired : () => { state = "idle"; idle.resume(); } });
    hop(0, 60, 0.22, 0.2);
    hop(0.42, 35, 0.18, 0.18);
    happyTl
      .to(root, { scaleY: 1, scaleX: 1, duration: 0.25, ease: "back.out(3)" }, LANDED)
      .to(leafJump, { rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.35)" }, LANDED)
      .fromTo(armL, { scaleX: 1, skewY: 0 }, { scaleX: 0.82, skewY: 2, duration: 0.16, repeat: 5, yoyo: true, ease: "sine.inOut" }, 0)
      .fromTo(armR, { scaleX: 1, skewY: 0 }, { scaleX: 0.82, skewY: -2, duration: 0.16, repeat: 5, yoyo: true, ease: "sine.inOut" }, 0.16)
      .to(arms, { rotation: 0, duration: 0.2 }, 0);
    if (!worn) happyTl.add(() => { if (queued) happy(); }, LANDED);
  };

  const sweatTl = gsap.timeline({ paused: true, repeat: -1 });
  drops.forEach((drop, i) => {
    const left = i % 2 === 0;
    const x0 = left ? 222 : 352;
    sweatTl.fromTo(drop,
      { x: x0, y: 262, rotation: left ? -35 : 35, scale: 0.8, opacity: 0, transformOrigin: "50% 50%" },
      { x: x0 + (left ? -120 : 120), y: 360, rotation: left ? -75 : 75, scale: 1.55, duration: 1, ease: "power1.in",
        keyframes: { opacity: [0, 1, 1, 0] } }, i * 0.3);
  });
  const tired = () => {
    state = "tired";
    toRest({ y: 6, duration: 0.3 });
    gsap.to(leafSway, { timeScale: 0.5, duration: 0.6 });
    sweatTl.restart();
    const pant = { scaleY: 1.035, scaleX: 0.985, duration: 0.24, repeat: 11, yoyo: true, ease: "sine.inOut" };
    const tl = gsap.timeline({ onComplete: recover });
    tl.to(eyes, { scaleY: 0.45, duration: 0.3, ease: "power2.out" }, 0)
      .to([upper, ...arms], { y: 22, duration: 0.4, ease: "power2.out" }, 0)
      .to(root, { scaleY: 1, scaleX: 1, duration: 0.3 }, 0)
      .to(armL, { rotation: -14, duration: 0.5, ease: "power2.out" }, 0)
      .to(armR, { rotation: 14, duration: 0.5, ease: "power2.out" }, 0)
      .to(legL, { rotation: 10, duration: 0.4, ease: "power2.out" }, 0)
      .to(legR, { rotation: -10, duration: 0.4, ease: "power2.out" }, 0)
      .to(leafJump, { rotation: 0, duration: 0.5 }, 0)
      .to(shadow, { scaleX: 1.06, opacity: 0.2, duration: 0.4 }, 0)
      .to(upper, pant, 0.4);
    // Keep the shoulders attached to the panting body.
    const { scaleX, scaleY, ...beat } = pant;
    const shoulder = (arm, sx, sy) =>
      tl.to(arm, { x: (sx - 290) * (scaleX - 1), y: 22 + (sy - 860) * (scaleY - 1), ...beat }, 0.4);
    shoulder(armL, 128, 525);
    shoulder(armR, 420, 520);
  };
  const recover = () => {
    sweatTl.pause();
    gsap.to(drops, { opacity: 0, duration: 0.2 });
    gsap.to(leafSway, { timeScale: 1, duration: 0.5 });
    toRest({ duration: 0.3 });
    standUp();
  };
  const standUp = () => gsap.timeline({ onComplete: () => { state = "idle"; idle.restart(); nap(); } })
    .to([upper, ...arms, ...legs], { x: 0, y: 0, rotation: 0, scaleY: 1, scaleX: 1, duration: 0.45, ease: "back.out(2)" }, 0)
    .to(shadow, { scale: 1, opacity: 0.18, duration: 0.45 }, 0)
    .to(eyes, { scaleY: 1, duration: 0.25 }, 0.15);

  let sleepTl;
  const zTl = gsap.timeline({ paused: true, repeat: -1 });
  zs.forEach((z, i) => {
    zTl.fromTo(z, { x: 0, y: 0, opacity: 0, scale: 0.6, svgOrigin: "450 310" },
      { x: 60, y: -170, scale: 1.2, duration: 2.4, ease: "sine.out",
        keyframes: { opacity: [0, 1, 1, 0] } }, i * 0.8);
  });
  const sleep = () => {
    if (state !== "idle") return;
    state = "sleep";
    idle.pause();
    toRest({ duration: 0.4 });
    gsap.to(leafSway, { timeScale: 0.4, duration: 1 });
    sleepTl = gsap.timeline()
      .to(eyes, { scaleY: 0.08, duration: 0.8, ease: "power2.inOut" }, 0)
      .to(arms, { rotation: 0, duration: 0.5 }, 0)
      .to([upper, ...arms, ...legs], { y: 45, duration: 0.9, ease: "power3.in" }, 0.3)
      .to(shadow, { scaleX: 1.12, opacity: 0.22, duration: 0.9, ease: "power3.in" }, 0.3)
      .to(legL, { rotation: 28, duration: 0.9, ease: "power3.in" }, 0.3)
      .to(legR, { rotation: -28, duration: 0.9, ease: "power3.in" }, 0.3)
      .to(upper, { scaleY: 1.018, scaleX: 0.99, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" }, 1.2)
      .add(() => zTl.restart(), 1.2);
  };
  const wake = () => {
    if (state !== "sleep") return;
    state = "waking";
    sleepTl?.kill();
    zTl.pause();
    gsap.to(zs, { opacity: 0, duration: 0.2 });
    gsap.to(leafSway, { timeScale: 1, duration: 0.5 });
    // Startled: pops up, eyes wide, arms flung out, "!" above the head.
    gsap.timeline({ onComplete: () => { state = "idle"; idle.restart(); nap(); } })
      .to([upper, ...arms, ...legs], { x: 0, y: 0, rotation: 0, scaleY: 1, scaleX: 1, duration: 0.2, ease: "power2.out" }, 0)
      .to(shadow, { scale: 1, opacity: 0.18, duration: 0.3 }, 0)
      .to(eyes, { scaleY: 1.3, scaleX: 1.2, duration: 0.12, ease: "power2.out" }, 0)
      .to(root, { y: -28, duration: 0.12, ease: "power2.out" }, 0)
      .to(root, { y: 0, duration: 0.35, ease: "bounce.out" }, 0.12)
      .to(armL, { rotation: 25, duration: 0.12 }, 0)
      .to(armR, { rotation: -25, duration: 0.12 }, 0)
      .fromTo(bang, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(3)" }, 0.05)
      .to(bang, { opacity: 0, duration: 0.3 }, 0.9)
      .to(eyes, { scaleY: 1, scaleX: 1, duration: 0.3 }, 0.9)
      .to(arms, { rotation: 0, duration: 0.3, ease: "power2.inOut" }, 0.9);
  };

  // Love: rubbing with the button held.
  const cheeks = [$("path7"), $("path51")];
  const hearts = el("g", { fill: "#ff5c8a", stroke: "#074e2d", "stroke-width": 5, "stroke-linejoin": "round" });
  hearts.style.pointerEvents = "none";
  svg.append(hearts);
  let rubbing = null;
  let petted = false;
  let loveTimer;
  let lastHeart = 0;
  // Rubbing fills a gauge (px moved) that drains when the hand slows down.
  const RUB_ENERGY = 100;
  const RUB_DRAIN = 50;
  const spawnHeart = () => {
    const h = el("path", { d: "M 0 14 C -26 -4 -18 -26 0 -10 C 18 -26 26 -4 0 14 Z", opacity: 0 });
    hearts.append(h);
    const x = 170 + Math.random() * 230;
    gsap.timeline({ onComplete: () => h.remove() })
      .fromTo(h, { x, y: 340, scale: 0.5, transformOrigin: "50% 50%" },
        { x: x + (Math.random() - 0.5) * 90, y: 150 - Math.random() * 60, scale: 1.3 + Math.random() * 0.8,
          duration: 1.7, ease: "sine.out" }, 0)
      .to(h, { opacity: 1, duration: 0.2 }, 0)
      .to(h, { opacity: 0, duration: 0.5 }, 1.2);
  };
  const startLove = () => {
    state = "love";
    idle.pause();
    gsap.to(eyes, { scaleY: 0.08, duration: 0.5, ease: "power2.inOut", overwrite: "auto" });
    gsap.to(cheeks, { fill: "#ffa3b8", scale: 1.4, transformOrigin: "50% 50%", duration: 0.4 });
  };
  const endLove = () => {
    if (state !== "love") return;
    clearTimeout(loveTimer);
    state = "idle";
    gsap.to(eyes, { scaleY: 1, duration: 0.25, overwrite: "auto" });
    gsap.to(cheeks, { fill: "#f0e9aa", scale: 1, duration: 0.5 });
    gsap.to(root, { rotation: 0, duration: 0.5, ease: "back.out(2)", overwrite: "auto" });
    idle.resume();
    if (rubbing) rubbing.energy = 0;
  };
  const rub = (e) => {
    if (!rubbing) return;
    const moved = Math.hypot(e.clientX - rubbing.x, e.clientY - rubbing.y);
    const drained = rubbing.energy - RUB_DRAIN * (e.timeStamp - rubbing.t) / 1000;
    rubbing.energy = Math.max(0, drained) + moved;
    rubbing.x = e.clientX;
    rubbing.y = e.clientY;
    rubbing.t = e.timeStamp;
    if (state === "idle" && rubbing.energy > RUB_ENERGY) startLove();
    if (state !== "love") return;
    petted = true;
    clearTimeout(loveTimer);
    loveTimer = setTimeout(finishLove, 800);
    const { left, width } = svg.getBoundingClientRect();
    gsap.to(root, { rotation: gsap.utils.clamp(-1, 1, (e.clientX - left) / width * 2 - 1), duration: 0.4, overwrite: "auto" });
    if (e.timeStamp - lastHeart > 220) {
      lastHeart = e.timeStamp;
      spawnHeart();
    }
  };

  const finishLove = ctx.add(null, endLove);
  const fallAsleep = ctx.add(null, sleep);
  let timer;
  const SLEEP_AFTER = 6000;
  const nap = () => { clearTimeout(timer); timer = setTimeout(fallAsleep, SLEEP_AFTER); };

  window.addEventListener("pointermove", ctx.add(null, (e) => { follow(e); nap(); }), { passive: true, signal });
  window.addEventListener("keydown", ctx.add(null, () => { wake(); nap(); }), { signal });
  svg.addEventListener("pointerenter", ctx.add(null, () => { wake(); nap(); }), { signal });
  svg.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    rubbing = { x: e.clientX, y: e.clientY, t: e.timeStamp, energy: 0 };
    petted = false;
  }, { signal });
  svg.addEventListener("pointermove", ctx.add(null, rub), { signal });
  const release = () => { rubbing = null; endLove(); };
  window.addEventListener("pointerup", ctx.add(null, release), { signal });
  window.addEventListener("pointercancel", ctx.add(null, release), { signal });
  svg.style.touchAction = "none";
  svg.addEventListener("click", ctx.add(null, () => {
    nap();
    if (petted) petted = false;
    else if (state === "sleep") wake();
    else press();
  }), { signal });
  svg.style.cursor = "pointer";
  svg.style.webkitTapHighlightColor = "transparent";
  nap();
  return () => { clearTimeout(timer); clearTimeout(loveTimer); };
}
