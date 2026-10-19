// Keep a quick click visible without tying feedback duration to how long it is held.
const reducedPress = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll<HTMLElement>('.project-cta__link, .hero__explore, .site-header__links a, .cases__controls button, .channel__value[href], .faq__item summary, .site-header__home, .site-footer__home, .channel__copy').forEach(element => {
  let effect: Animation | undefined;
  let started = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let held = false;
  let replay = false;
  let navigation: ReturnType<typeof setTimeout> | undefined;
  const begin = () => {
    if (reducedPress.matches || element.matches(':disabled')) return;
    clearTimeout(timer);
    const from = getComputedStyle(element).scale;
    effect?.cancel();
    started = performance.now();
    held = true;
    element.setAttribute('data-pressed', '');
    // Only long questions and contact text use the softer, size-aware press.
    const size = Math.max(1, element.offsetWidth, element.offsetHeight);
    const gentle = element.matches('.faq__item summary, .channel__value[href]');
    const pressedScale = gentle ? Math.max(0.985, 1 - 4 / size) : 0.97;
    effect = element.animate([{ scale: from === 'none' ? '1' : from }, { scale: pressedScale }], {
      duration: 220, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards',
    });
  };
  const release = () => {
    if (!held) return;
    held = false;
    timer = setTimeout(() => {
      const from = getComputedStyle(element).scale;
      effect?.cancel();
      const returning = element.animate([{ scale: from }, { scale: '1' }], {
        duration: 280, easing: 'cubic-bezier(0.4,0,0.2,1)',
      });
      effect = returning;
      returning.finished.then(() => { if (effect === returning) element.removeAttribute('data-pressed'); }).catch(() => {});
    }, Math.max(0, 260 - (performance.now() - started)));
  };
  element.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    begin();
    window.addEventListener('pointerup', release, { once: true });
    window.addEventListener('pointercancel', release, { once: true });
  });
  element.addEventListener('click', event => {
    if (replay || reducedPress.matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.detail === 0 || !effect) { begin(); release(); }
    if (element instanceof HTMLAnchorElement && ((element.hash && element.origin === location.origin && element.pathname === location.pathname) || element.matches('.channel__value[href]'))) {
      event.preventDefault();
      clearTimeout(navigation);
      navigation = setTimeout(() => {
        replay = true;
        element.click();
        replay = false;
      }, Math.max(0, 220 - (performance.now() - started)));
    }
  });
  reducedPress.addEventListener('change', () => { clearTimeout(timer); effect?.cancel(); held = false; element.removeAttribute('data-pressed'); });
  window.addEventListener('blur', release);
});
