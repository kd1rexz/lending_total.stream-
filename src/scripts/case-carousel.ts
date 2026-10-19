document.querySelectorAll<HTMLElement>('[data-case-carousel]').forEach(root => {
  const track = root.querySelector<HTMLElement>('[data-case-track]');
  const controls = root.querySelector<HTMLElement>('[data-case-controls]');
  const previous = root.querySelector<HTMLButtonElement>('[data-case-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-case-next]');
  const count = root.querySelector<HTMLElement>('[data-case-count]');
  const slides = [...root.querySelectorAll<HTMLElement>('[data-case-slide]')];
  if (!track || !controls || !previous || !next || !count || !slides.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let version = 0;
  let effects: Animation[] = [];
  let transitioning = false;
  let pending: number | undefined;
  const content = (slide: HTMLElement) => [...slide.querySelectorAll<HTMLElement>('.case-slide__visual, .case-slide__caption')];
  const render = () => {
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    count.textContent = `${index + 1} / ${slides.length}`;
    slides.forEach((slide, i) => {
      slide.inert = i !== index;
      slide.setAttribute('aria-hidden', String(i !== index));
    });
  };
  const settle = () => {
    effects.forEach(effect => effect.cancel());
    effects = [];
    slides.forEach((slide, i) => slide.toggleAttribute('data-active', i === index));
  };
  const go = (target: number) => {
    target = Math.max(0, Math.min(slides.length - 1, target));
    if (transitioning) { pending = target; return; }
    if (target === index) return;
    // Capture the visible blend before cancellation so a reversal continues from this frame.
    const startingOpacity = slides.map(slide => content(slide).map(element =>
      slide.hasAttribute('data-active') ? getComputedStyle(element).opacity : '0'));
    effects.forEach(effect => effect.cancel());
    effects = [];
    const currentVersion = ++version;
    index = target;
    render();
    if (reduced.matches) { settle(); return; }
    transitioning = true;
    slides.forEach((slide, i) => {
      slide.style.zIndex = i === target ? '2' : '1';
      slide.toggleAttribute('data-active', i === target || startingOpacity[i].some(value => Number(value) > 0));
      content(slide).forEach((element, j) => {
        // Hold the outgoing photo beneath the incoming one: fading both caused a dark dip.
        const outgoingPhoto = i !== target && element.classList.contains('case-slide__visual');
        const toOpacity = i === target ? '1' : outgoingPhoto ? startingOpacity[i][j] : '0';
        effects.push(element.animate([{ opacity: startingOpacity[i][j] }, { opacity: toOpacity }], {
          duration: 470,
          easing: 'cubic-bezier(0.45,0,0.55,1)', fill: 'forwards',
        }));
      });
    });
    Promise.all(effects.map(effect => effect.finished)).then(() => {
      if (version !== currentVersion) return;
      settle();
      transitioning = false;
      const queued = pending;
      pending = undefined;
      if (queued !== undefined) go(queued);
    }).catch(() => {});
  };
  slides[0].setAttribute('data-active', '');
  track.setAttribute('data-case-enhanced', '');
  render();
  previous.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); go(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let touchStart: { x: number; y: number } | undefined;
  track.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
  });
  track.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = undefined;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
  });
  track.addEventListener('pointercancel', () => { touchStart = undefined; });
  reduced.addEventListener('change', () => { version++; transitioning = false; pending = undefined; settle(); });
  controls.hidden = false;
});
