// Astro includes this module once, even when the Star component appears many times.
const stars = Array.from(document.querySelectorAll<SVGElement>('[data-scroll-star]'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const degreesPerPixel = 0.12;
const smoothingMs = 110;

let frame = 0;
let previousTime = 0;
let target = 0;
let rotation = 0;

function paint(): void {
  const angle = `${rotation.toFixed(3)}deg`;
  // The individual rotate property preserves each section's original transform.
  for (const star of stars) star.style.rotate = angle;
}

function animate(time: number): void {
  const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
  previousTime = time;
  rotation += (target - rotation) * (1 - Math.exp(-elapsed / smoothingMs));

  if (Math.abs(target - rotation) < 0.02) {
    rotation = target;
    frame = 0;
    previousTime = 0;
    paint();
    return;
  }

  paint();
  frame = requestAnimationFrame(animate);
}

function onScroll(): void {
  if (reducedMotion.matches || document.hidden) return;
  target = Math.max(0, window.scrollY) * degreesPerPixel;
  if (!frame) frame = requestAnimationFrame(animate);
}

function syncMotion(): void {
  cancelAnimationFrame(frame);
  frame = 0;
  previousTime = 0;
  target = rotation = Math.max(0, window.scrollY) * degreesPerPixel;

  if (reducedMotion.matches) {
    for (const star of stars) star.style.removeProperty('rotate');
  } else if (!document.hidden) {
    paint();
  }
}

if (stars.length) {
  syncMotion();
  window.addEventListener('scroll', onScroll, { passive: true });
  reducedMotion.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
}
