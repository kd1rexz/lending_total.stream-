const header = document.querySelector<HTMLElement>('[data-site-header]');
if (header) {
  let previous = Math.max(0, scrollY);
  let direction = 0;
  let distance = 0;
  let frame = 0;
  header.setAttribute('data-scroll-header', '');
  const show = () => header.removeAttribute('data-header-hidden');
  const update = () => {
    frame = 0;
    const y = Math.max(0, scrollY);
    const delta = y - previous;
    const nextDirection = Math.sign(delta);
    if (nextDirection && nextDirection !== direction) distance = 0;
    if (nextDirection) direction = nextDirection;
    distance += Math.abs(delta);
    previous = y;
    header.toggleAttribute('data-scrolled', y > 48);
    const menuOpen = header.querySelector('[data-menu-toggle]')?.getAttribute('aria-expanded') === 'true';
    const focused = document.activeElement instanceof HTMLElement && header.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    if (y <= 24 || menuOpen || focused) show();
    else if (distance >= 10) header.toggleAttribute('data-header-hidden', direction > 0);
  };
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  header.addEventListener('focusin', show);
  header.addEventListener('click', show);
  addEventListener('pageshow', update);
  update();
}
