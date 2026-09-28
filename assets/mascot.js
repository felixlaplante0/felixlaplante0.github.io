// Animated zucchini mascot. Progressive enhancement: the static <img> stays
// in place unless GSAP is available and the SVG can be inlined.
(async () => {
  const img = document.querySelector(".mascot img[src$='logo.svg']");
  const gsap = window.gsap;
  if (!img || !gsap || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let svg;
  try {
    const text = await (await fetch(img.src)).text();
    svg = new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
  } catch {
    return;
  }
  if (!svg || svg.nodeName !== "svg") return;

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

  svg.querySelector("sodipodi\\:namedview, namedview")?.remove();
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.classList.add("mascot-svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", img.alt || "Zucchini mascot");

  // Each part (body, leaf, arms, feet) has its own outline in the SVG
  // (#outline-<part>); move it into the part's group so they animate together.
  const parts = {
    leaf: range(52, 56),
    legR: [$("path26"), ...range(57, 59)],
    armR: range(60, 63),
    legL: range(64, 66),
    armL: range(67, 68),
  };
  const silhouette = $("path2");
  const defs = el("defs");
  svg.prepend(defs);
  const box = { maskUnits: "userSpaceOnUse", x: -100, y: -100, width: 800, height: 1150 };

  // Part outlines were hidden by the body where they overlap it; now that
  // parts are drawn above the body, mask that overlap out explicitly.
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
  // Feet also stop at the body's own outline, so no rim runs along the joint.
  const offBodyMask = offBody("zm-off-body", 0);
  const offBodyFeet = offBody("zm-off-body-feet", 16);

  // The body is notched under the right foot; fill it so the notch never
  // shows when that foot moves (its outline is part of #outline-body).
  const notch = el("path", {
    d: "M 336 838 C 362 830 392 816 409 795 L 399 803 L 383 806 L 363 809 L 347 815 L 343 821 L 343 837 Z",
    fill: "#99d172",
  });
  silhouette.after(notch);

  // Only the white glints move, sliding inside the dark irises.
  const clip = (id, paths) => {
    const c = el("clipPath", { id });
    c.append(...paths.map((p) => { const n = p.cloneNode(); n.removeAttribute("id"); return n; }));
    defs.append(c);
    return `url(#${id})`;
  };
  const eyeL = wrap([$("path6"), ...range(10, 20)]);
  const eyeR = wrap(range(42, 50));
  const glintL = wrap([$("path12")]);
  wrap([glintL], { "clip-path": clip("zm-irisL", [$("path11")]) });
  const glintR = wrap([$("path45")]);
  wrap([glintR], { "clip-path": clip("zm-irisR", [$("path42")]) });

  const groups = {};
  for (const [name, paths] of Object.entries(parts)) {
    groups[name] = wrap(paths);
    const rim = $(`outline-${name}`);
    if (rim) {
      if (name !== "armL") rim.setAttribute("mask", name.startsWith("leg") ? offBodyFeet : offBodyMask);
      groups[name].prepend(rim);
    }
  }
  const { armL, armR, legL, legR, leaf } = groups;
  // Jumps move an outer wrapper so the sway never has to stop (no snapping).
  const leafJump = wrap([leaf]);
  // The left foot is cut flat along the body, so it sits behind the body with
  // a hidden extension; turning it then never opens a gap at the joint.
  legL.children[0].after(el("ellipse", { cx: 186, cy: 818, rx: 24, ry: 22, fill: "#55c775" }));
  // Same for the left arm: behind the body, its shoulder cut never shows.
  armL.children[0].after(el("ellipse", { cx: 152, cy: 532, rx: 34, ry: 32, fill: "#55c775" }));
  const upper = wrap([...svg.children].filter((n) => n !== defs && ![legR, armR, legL, armL].includes(n)));
  const root = wrap([legL, armL, upper, legR, armR]);
  const shadow = el("ellipse", { cx: 280, cy: 912, rx: 215, ry: 20, fill: "#074e2d", opacity: 0.18 });
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

  // Sweat drops for the exhausted state, spraying off both sides of the head.
  const sweat = el("g", { fill: "#3fa9f5", stroke: "#074e2d", "stroke-width": 5, "stroke-linejoin": "round" });
  const drops = Array.from({ length: 6 }, () =>
    el("path", { d: "M 0 -22 C 8 -8 13 0 13 8 A 13 13 0 0 1 -13 8 C -13 0 -8 -8 0 -22 Z", opacity: 0 }));
  sweat.append(...drops);
  svg.append(sweat);
  svg.style.overflow = "visible";

  img.replaceWith(svg);

  gsap.set(armL, { svgOrigin: "118 515" });
  gsap.set(armR, { svgOrigin: "410 510" });
  gsap.set(legL, { svgOrigin: "180 838" });
  gsap.set(legR, { svgOrigin: "345 838" });
  gsap.set(upper, { svgOrigin: "280 850" });
  gsap.set(root, { svgOrigin: "280 915" });
  gsap.set(eyeL, { svgOrigin: "195 460" });
  gsap.set(eyeR, { svgOrigin: "335 462" });
  gsap.set([leaf, leafJump], { svgOrigin: "280 196" });
  gsap.set(shadow, { svgOrigin: "280 912" });

  // The leaf sways gently in every state.
  const leafSway = gsap.fromTo(leaf, { rotation: -5 },
    { rotation: 5, duration: 1.7, repeat: -1, yoyo: true, ease: "sine.inOut" });

  let state = "idle"; // idle | happy | tired | sleep | waking

  // Idle: breathing and a slight arm sway.
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

  // Each glint's neutral spot and how far it may go right (see follow()):
  // the right-hand iris has more room on that side.
  const gaze = [
    { glint: glintL, rest: { x: -2, y: 2 }, right: 1 },
    { glint: glintR, rest: { x: -1, y: 2 }, right: 5 },
  ];
  const toRest = (vars) => gaze.forEach(({ glint, rest }) => gsap.to(glint, { ...rest, ...vars }));
  gaze.forEach(({ glint, rest }) => gsap.set(glint, rest));
  const follow = (e) => {
    if (state === "sleep" || state === "tired") return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const cx = (265 * ctm.a) + ctm.e;
    const cy = (462 * ctm.d) + ctm.f;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // The glints travel inside a tall ellipse, like the irises. They are
    // drawn high and to the right, so the ellipse is centred a little down
    // and to the left of them, with little reach up or right. Inside it the
    // axes are independent (sweeping sideways never moves them up or down);
    // at its edge they are pulled back onto it.
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
  // A new jump may only start once the previous one has landed (the second
  // hop touches down at LANDED). A click during the last 40% of the hops
  // is queued and fires on touchdown; earlier clicks are ignored.
  const LANDED = 0.78;
  const QUEUE_FROM = LANDED * 0.6;
  let queued = false;
  let wearingOut = false; // the current jump ends in the exhausted state
  const press = () => {
    if (state === "idle") return happy();
    if (state !== "happy" || wearingOut) return;
    const t = happyTl.time();
    if (t >= LANDED) happy();
    else if (t >= QUEUE_FROM) queued = true;
  };
  // Three jumps within three seconds wear the mascot out.
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
    // Arms swing back and forth (foreshortened toward/away from the viewer).
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

  // Exhausted: slumps, droopy eyes, arms dangling, panting and sweating,
  // then pulls itself back together.
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
    // Keep the shoulders attached while the body stretches about (280, 850).
    const { scaleX, scaleY, ...beat } = pant;
    const shoulder = (arm, sx, sy) =>
      tl.to(arm, { x: (sx - 280) * (scaleX - 1), y: 22 + (sy - 850) * (scaleY - 1), ...beat }, 0.4);
    shoulder(armL, 118, 515);
    shoulder(armR, 410, 510);
  };
  const recover = () => {
    sweatTl.pause();
    gsap.to(drops, { opacity: 0, duration: 0.2 });
    gsap.to(leafSway, { timeScale: 1, duration: 0.5 });
    toRest({ duration: 0.3 });
    standUp();
  };
  // Back to the idle pose (after being tired or asleep).
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
    // Sits down: everything sinks and the feet splay outward around the joints.
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
    standUp();
  };

  let timer;
  const SLEEP_AFTER = 6000;
  const nap = () => { clearTimeout(timer); timer = setTimeout(sleep, SLEEP_AFTER); };

  window.addEventListener("pointermove", (e) => { follow(e); nap(); }, { passive: true });
  window.addEventListener("keydown", () => { wake(); nap(); });
  svg.addEventListener("pointerenter", () => { wake(); nap(); });
  svg.addEventListener("click", () => {
    nap();
    if (state === "sleep") wake();
    else press();
  });
  svg.style.cursor = "pointer";
  nap();
})();
