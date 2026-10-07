(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canScroll = !reduce && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && typeof Lenis !== "undefined";

  function settleVisible() {
    if (typeof ScrollTrigger === "undefined") return;
    ScrollTrigger.getAll().forEach(function (st) {
      if (!st.animation || !st.trigger || !st.trigger.getBoundingClientRect) return;
      if (st.trigger.getBoundingClientRect().top < window.innerHeight * 0.92) {
        st.animation.progress(1);
      }
    });
  }

  function bootPreloader(lenis) {
    if (lenis) lenis.stop();

    function reveal() {
      var el = document.getElementById("preloader");
      function gone() {
        if (el && el.parentNode) el.parentNode.removeChild(el);
        document.documentElement.classList.remove("is-booting");
        if (lenis) {
          lenis.start();
          ScrollTrigger.refresh();
        }
      }
      if (!el) {
        gone();
        return;
      }
      settleVisible();
      if (reduce || typeof gsap === "undefined") {
        gone();
        return;
      }
      gsap.to(el, {
        autoAlpha: 0,
        scale: 0.985,
        duration: 0.55,
        ease: "power2.inOut",
        onComplete: gone
      });
    }

    if (document.readyState === "complete") reveal();
    else window.addEventListener("load", reveal);
  }

  if (!canScroll) {
    bootPreloader(null);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var style = document.createElement("style");
  style.textContent =
    ".gsap-reveal{animation:none !important}" +
    ".gsap-reveal.is-revealing{transition:none !important}";
  document.head.appendChild(style);

  var lenis = new Lenis({
    duration: 1.15,
    easing: function (t) {
      return Math.min(1, 1.001 - Math.pow(2, -10 * t));
    },
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1,
    syncTouch: false,
    autoRaf: false
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  window.bsLenis = lenis;
  lenis.stop();

  var SKIP = "nav, .navbar, .nav, .mobile-menu, .mobile-overlay, .bsew-stage, .shop-stage, .shop-rail, .cart-drawer, .dropdown-menu";
  var LEGACY = ".animate, [data-r], [data-reveal], .reveal, .reveal-l, .reveal-r";

  function skipped(el) {
    return !el || !!el.closest(SKIP);
  }

  function visibleBox(el) {
    return el.getClientRects().length > 0;
  }

  function kidsOf(parent) {
    return Array.prototype.filter.call(parent.children, function (child) {
      return child.nodeType === 1 && !skipped(child);
    });
  }

  function prep(list) {
    list.forEach(function (el) {
      el.setAttribute("data-scroll-done", "1");
      el.classList.add("gsap-reveal", "is-revealing");
    });
    gsap.set(list, { opacity: 1, x: 0, y: 0, visibility: "visible", willChange: "transform, opacity" });
  }

  function finish(list) {
    list.forEach(function (el) {
      el.classList.add("vis", "visible", "in", "is-revealed");
    });
    gsap.set(list, { clearProps: "opacity,visibility,transform,x,y,willChange" });
    list.forEach(function (el) {
      el.classList.remove("is-revealing");
    });
  }

  function fade(el) {
    if (!el || el.getAttribute("data-scroll-done") === "1" || skipped(el) || !visibleBox(el)) return;
    if (el.closest('[data-scroll-reveal="stagger"]')) return;
    prep([el]);
    gsap.from(el, {
      y: 56,
      autoAlpha: 0,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onComplete: function () { finish([el]); }
    });
  }

  function stagger(parent, group) {
    var list = (group || kidsOf(parent)).filter(function (el) {
      return el.getAttribute("data-scroll-done") !== "1" && visibleBox(el);
    });
    if (!list.length) return;
    parent.classList.add("gsap-reveal", "vis", "visible", "in", "is-revealed");
    parent.setAttribute("data-scroll-done", "1");
    prep(list);
    gsap.from(list, {
      y: 40,
      autoAlpha: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: parent, start: "top 86%", once: true },
      onComplete: function () { finish(list); }
    });
  }

  function mount() {
    var seen = new Set();

    gsap.utils.toArray('[data-scroll-reveal="stagger"]').forEach(function (parent) {
      if (skipped(parent) || !visibleBox(parent)) return;
      var group = kidsOf(parent);
      group.forEach(function (el) { seen.add(el); });
      seen.add(parent);
      stagger(parent, group);
    });

    gsap.utils.toArray('[data-scroll-reveal="fade-up"]').forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);
      fade(el);
    });

    var byParent = new Map();
    gsap.utils.toArray(LEGACY).forEach(function (el) {
      if (seen.has(el) || skipped(el) || el.closest('[data-scroll-reveal="stagger"]')) return;
      if (el.getAttribute("data-scroll-done") === "1") return;
      var parent = el.parentElement;
      if (!parent) return;
      if (!byParent.has(parent)) byParent.set(parent, []);
      byParent.get(parent).push(el);
    });

    byParent.forEach(function (group, parent) {
      if (group.length >= 2) {
        group.forEach(function (el) { seen.add(el); });
        stagger(parent, group);
      } else {
        seen.add(group[0]);
        fade(group[0]);
      }
    });
  }

  mount();
  bootPreloader(lenis);

  function remount() {
    requestAnimationFrame(function () {
      mount();
      ScrollTrigger.refresh();
    });
  }

  ["aboutMoreBtn", "bsewSolution"].forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", remount);
  });
})();
