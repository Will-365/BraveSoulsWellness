(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layers = Array.from(document.querySelectorAll("[data-parallax]")).map(
    (el) => ({
      el,
      speed: parseFloat(el.getAttribute("data-parallax")) || 0.12,
    }),
  );
  if (!layers.length) return;

  let ticking = false;

  function update() {
    const vh = window.innerHeight;
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const rect = layer.el.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > vh + 120) continue;
      const center = rect.top + rect.height * 0.5;
      const offset = (vh * 0.5 - center) * layer.speed;
      layer.el.style.translate = "0 " + offset.toFixed(2) + "px";
    }
    ticking = false;
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  update();
})();
