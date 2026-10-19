document.querySelectorAll<HTMLElement>('[data-project-cta]').forEach(root => {
  if (root.dataset.enhanced) return;
  root.dataset.enhanced = 'true';
  const link = root.querySelector<HTMLAnchorElement>('a');
  if (!link) return;
  const fine = matchMedia('(min-width: 64rem) and (hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0;
  let frame = 0, previous = 0;
  const write = () => {
    root.style.setProperty('--magnet-x', `${x.toFixed(3)}px`);
    root.style.setProperty('--magnet-y', `${y.toFixed(3)}px`);
  };
  const tick = (time: number) => {
    const dt = previous ? Math.min((time - previous) / 1000, 1 / 30) : 1 / 60;
    previous = time;
    vx += ((tx - x) * 220 - vx * 18) * dt;
    vy += ((ty - y) * 220 - vy * 18) * dt;
    x += vx * dt;
    y += vy * dt;
    const settled = Math.abs(tx - x) + Math.abs(ty - y) < 0.01 && Math.abs(vx) + Math.abs(vy) < 0.05;
    if (settled) { x = tx; y = ty; vx = 0; vy = 0; }
    write();
    frame = settled ? 0 : requestAnimationFrame(tick);
    if (settled) previous = 0;
  };
  const start = () => { if (!frame) frame = requestAnimationFrame(tick); };
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0; previous = 0;
    x = 0; y = 0; vx = 0; vy = 0; tx = 0; ty = 0;
    root.removeAttribute('data-hover');
    write();
  };
  const move = (event: PointerEvent) => {
    if (!fine.matches || event.pointerType === 'touch') return;
    root.setAttribute('data-hover', '');
    const bounds = root.getBoundingClientRect();
    const px = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
    const py = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
    root.style.setProperty('--light-x', `${((px / bounds.width) * 100).toFixed(2)}%`);
    root.style.setProperty('--light-y', `${((py / bounds.height) * 100).toFixed(2)}%`);
    if (reduced.matches) return;
    tx = (px / bounds.width - 0.5) * 12;
    ty = (py / bounds.height - 0.5) * 6;
    start();
  };
  const leave = () => {
    root.removeAttribute('data-hover');
    tx = 0; ty = 0;
    if (!reduced.matches) start();
  };
  root.addEventListener('pointerenter', move);
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerleave', leave);
  root.addEventListener('pointercancel', reset);
  link.addEventListener('blur', leave);
  fine.addEventListener('change', reset);
  reduced.addEventListener('change', reset);
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
});
