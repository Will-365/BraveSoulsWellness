(function initShopRails() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cats = Array.from(document.querySelectorAll(".shop-cat"));
  const dots = Array.from(document.querySelectorAll(".shop-dot"));
  const pickers = Array.from(document.querySelectorAll("[data-shop-pick]"));
  if (!cats.length) return;

  const HOLD = 7000;
  let current = 0;
  let holdUntil = 0;
  let rotating = !reduce;
  let locked = false;
  const states = new Map();

  function fillTrack(rail, track) {
    const base = track.innerHTML;
    if (!base.trim()) return 1;
    const unique = track.children.length;
    let copies = 1;
    const stage = document.querySelector(".shop-aisle");
    const basis = Math.max(rail.clientWidth, stage ? stage.clientWidth : 0, 1100);
    const need = basis * 3;
    const minCopies = unique <= 3 ? 12 : 4;
    while ((track.scrollWidth < need || copies < minCopies) && copies < 24) {
      track.insertAdjacentHTML("beforeend", base);
      copies += 1;
    }
    return copies;
  }

  function descOpen() {
    const cat = cats[current];
    return !!(cat && cat.classList.contains("open"));
  }

  function armHold(now) {
    holdUntil = (now || performance.now()) + HOLD;
  }

  function resume() {
    rotating = !reduce && !locked && !descOpen();
    if (rotating) armHold();
  }

  function syncPicker() {
    pickers.forEach(function (input) {
      const on = locked && input.value === String(current);
      input.checked = on;
      input.dataset.was = on ? "1" : "0";
      const label = input.closest("label");
      if (label) label.classList.toggle("is-on", on);
    });
  }

  function bindRail(rail) {
    const track = rail.querySelector(".shop-track");
    if (!track) return null;
    const unique = track.children.length;
    const speed = parseFloat(rail.getAttribute("data-speed")) || 0.032;
    const copies = fillTrack(rail, track);
    const state = {
      rail: rail,
      track: track,
      speed: speed,
      unique: unique,
      offset: 0,
      paused: reduce,
      dragging: false,
      lastX: 0,
      copies: copies,
      loop: Math.max(1, track.scrollWidth / copies),
    };
    function apply() {
      const w = state.loop || 1;
      state.offset = ((state.offset % w) + w) % w;
      track.style.transform = "translate3d(" + (-state.offset).toFixed(2) + "px,0,0)";
    }
    state.apply = apply;
    rail.addEventListener("pointerdown", function (e) {
      if (e.target.closest("a, button, input, label")) return;
      state.dragging = true;
      state.paused = true;
      state.lastX = e.clientX;
      rail.classList.add("is-dragging");
      try { rail.setPointerCapture(e.pointerId); } catch (err) {}
    });
    rail.addEventListener("pointermove", function (e) {
      if (!state.dragging) return;
      state.offset -= e.clientX - state.lastX;
      state.lastX = e.clientX;
      apply();
    });
    function endDrag() {
      if (!state.dragging) return;
      state.dragging = false;
      rail.classList.remove("is-dragging");
      state.paused = reduce;
    }
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    apply();
    return state;
  }

  cats.forEach(function (cat) {
    const rail = cat.querySelector(".shop-rail");
    const st = rail ? bindRail(rail) : null;
    if (st) states.set(cat, st);
  });

  function showCat(index) {
    current = (index + cats.length) % cats.length;
    cats.forEach(function (cat, i) {
      cat.classList.toggle("is-on", i === current);
      if (i !== current) {
        cat.classList.remove("open");
        const btn = cat.querySelector(".shop-toggle");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-on", i === current);
    });
    const st = states.get(cats[current]);
    if (st) {
      st.offset = 0;
      st.paused = reduce;
      st.loop = Math.max(1, st.track.scrollWidth / st.copies);
      st.apply();
    }
    syncPicker();
    resume();
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showCat(parseInt(dot.getAttribute("data-shop-dot"), 10) || 0);
    });
  });

  const prev = document.querySelector(".shop-nav-prev");
  const next = document.querySelector(".shop-nav-next");
  if (prev) prev.addEventListener("click", function () { showCat(current - 1); });
  if (next) next.addEventListener("click", function () { showCat(current + 1); });

  pickers.forEach(function (input) {
    const label = input.closest("label");
    if (!label) return;
    label.addEventListener("mousedown", function (e) {
      if (!input.checked) return;
      e.preventDefault();
      input.checked = false;
      locked = false;
      syncPicker();
      resume();
    });
    input.addEventListener("change", function () {
      if (!input.checked) return;
      locked = true;
      showCat(parseInt(input.value, 10) || 0);
    });
  });

  document.querySelectorAll(".shop-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const cat = btn.closest(".shop-cat");
      const open = cat.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      const label = btn.querySelector("span");
      if (label) label.textContent = open ? "Show less" : "Learn more";
      const st = states.get(cat);
      if (st) st.paused = reduce;
      resume();
    });
  });

  let lastT = performance.now();
  armHold(lastT);
  function tick(now) {
    const dt = Math.min(48, now - lastT);
    lastT = now;
    states.forEach(function (st) {
      const active = st.rail.closest(".shop-cat");
      const slide = active && active.classList.contains("is-on");
      if (slide && !st.paused) st.offset += st.speed * dt;
      st.apply();
    });
    if (rotating && !locked && !descOpen() && now >= holdUntil && cats.length > 1) {
      showCat(current + 1);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  window.addEventListener("resize", function () {
    states.forEach(function (st) {
      st.loop = Math.max(1, st.track.scrollWidth / st.copies);
    });
  });
  const sizes = document.getElementById("merchSizes");
  const sizeField = document.getElementById("merchSize");
  if (sizes && sizeField) {
    sizes.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-size]");
      if (!btn) return;
      sizes.querySelectorAll("[data-size]").forEach(function (el) {
        el.classList.toggle("is-on", el === btn);
      });
      sizeField.value = btn.getAttribute("data-size");
    });
  }
})();
