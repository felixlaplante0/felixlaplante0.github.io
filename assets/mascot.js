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
      rim.setAttribute("mask", name.startsWith("leg") ? offBodyFeet : offBodyMask);
      groups[name].prepend(rim);
    }
  }
  const { armL, armR, legL, legR, leaf } = groups;
  // Jumps move an outer wrapper so the sway never has to stop (no snapping).
  const leafJump = wrap([leaf]);
  // The left foot is cut flat along the body, so it sits behind the body with
  // a hidden extension; turning it then never opens a gap at the joint.
  legL.children[0].after(el("ellipse", { cx: 186, cy: 818, rx: 24, ry: 22, fill: "#55c775" }));
  const upper = wrap([...svg.children].filter((n) => n !== defs && ![legR, armR, legL, armL].includes(n)));
  const root = wrap([legL, upper, legR, armR, armL]);
  const shadow = el("ellipse", { cx: 280, cy: 912, rx: 215, ry: 20, fill: "#074e2d", opacity: 0.18 });
  root.before(shadow);
  const arms = [armL, armR];
  const legs = [legL, legR];
  const pupils = [glintL, glintR];

  const zzz = el("g", { fill: "#074e2d", "font-family": "sans-serif", "font-weight": "700" });
  const zs = [0, 1, 2].map(() => {
    const t = el("text", { x: 430, y: 330, "font-size": 70, opacity: 0 });
    t.textContent = "z";
    return t;
  });
  zzz.append(...zs);
  svg.append(zzz);
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

  let state = "idle"; // idle | happy | sleep | waking

  // Idle: breathing and a slight arm sway.
  const idle = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut", duration: 1.8 } })
    .to(upper, { scaleY: 1.012, scaleX: 0.994 }, 0)
    .to(armL, { rotation: 1.5 }, 0)
    .to(armR, { rotation: -1.5 }, 0);

  const blink = () => {
    if (state === "idle") {
      gsap.timeline()
        .to([eyeL, eyeR], { scaleY: 0.1, duration: 0.07, ease: "power1.in" })
        .to([eyeL, eyeR], { scaleY: 1, duration: 0.12, ease: "power1.out" });
    }
    gsap.delayedCall(1.5 + Math.random() * 2.5, blink);
  };
  gsap.delayedCall(1.5, blink);

  const follow = (e) => {
    if (state === "sleep") return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const cx = (265 * ctm.a) + ctm.e;
    const cy = (462 * ctm.d) + ctm.f;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, dist / 200);
    gsap.to(pupils, { x: (dx / dist) * k * 10, y: (dy / dist) * k * 10, duration: 0.25, ease: "power2.out", overwrite: "auto" });
  };

  let happyTl;
  const happy = () => {
    state = "happy";
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
    happyTl = gsap.timeline({ onComplete: () => { state = "idle"; idle.resume(); } });
    hop(0, 60, 0.22, 0.2);
    hop(0.42, 35, 0.18, 0.18);
    happyTl
      .to(root, { scaleY: 1, scaleX: 1, duration: 0.25, ease: "back.out(3)" }, 0.78)
      .to(leafJump, { rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.35)" }, 0.78)
      .to(armL, { scaleX: 0.82, skewY: 2, duration: 0.16, repeat: 5, yoyo: true, ease: "sine.inOut" }, 0)
      .to(armR, { scaleX: 0.82, skewY: -2, duration: 0.16, repeat: 5, yoyo: true, ease: "sine.inOut" }, 0.16)
      .to(arms, { rotation: 0, duration: 0.2 }, 0);
  };

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
    gsap.to(pupils, { x: 0, y: 0, duration: 0.4 });
    gsap.to(leafSway, { timeScale: 0.4, duration: 1 });
    // Sits down: everything sinks and the feet splay outward around the joints.
    sleepTl = gsap.timeline()
      .to([eyeL, eyeR], { scaleY: 0.08, duration: 0.8, ease: "power2.inOut" }, 0)
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
    gsap.timeline({ onComplete: () => { state = "idle"; idle.restart(); } })
      .to([upper, ...arms, ...legs], { x: 0, y: 0, rotation: 0, scaleY: 1, scaleX: 1, duration: 0.45, ease: "back.out(2)" }, 0)
      .to(shadow, { scale: 1, opacity: 0.18, duration: 0.45 }, 0)
      .to([eyeL, eyeR], { scaleY: 1, duration: 0.25 }, 0.15);
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
    else if (state === "idle" || state === "happy") happy();
  });
  svg.style.cursor = "pointer";
  nap();
})();
