/** Without JavaScript the navigation remains visible in the document. */
export function initNavigation(): void {
  for (const header of document.querySelectorAll<HTMLElement>('[data-site-header]')) {
    if (header.dataset.navigationInitialized === 'true') continue;
    const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
    const navigation = header.querySelector<HTMLElement>('[data-navigation]');
    const label = toggle?.querySelector<HTMLElement>('[data-menu-label]');
    if (!toggle || !navigation || !label) continue;
    const mobile = matchMedia('(max-width: 63.999rem)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let expanded = false;
    let effect: Animation | undefined;
    const render = (animate = true): void => {
      toggle.hidden = !mobile.matches;
      toggle.setAttribute('aria-expanded', String(expanded));
      label.textContent = 'Меню';
      if (!mobile.matches) {
        effect?.cancel(); effect = undefined;
        navigation.hidden = false; navigation.inert = false;
        navigation.removeAttribute('aria-hidden');
        return;
      }
      const wasHidden = navigation.hidden;
      const style = getComputedStyle(navigation);
      const fromOpacity = wasHidden ? '0' : style.opacity;
      const fromTransform = wasHidden ? 'translateY(-8px) scale(0.98)' : style.transform;
      effect?.cancel(); effect = undefined;
      navigation.inert = !expanded;
      navigation.setAttribute('aria-hidden', String(!expanded));
      if (!animate || reduced.matches || (!expanded && wasHidden)) {
        navigation.hidden = !expanded;
        return;
      }
      navigation.hidden = false;
      const current = navigation.animate([
        { opacity: fromOpacity, transform: fromTransform },
        { opacity: expanded ? '1' : '0', transform: expanded ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.98)' },
      ], { duration: expanded ? 260 : 180, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'both' });
      effect = current;
      current.finished.then(() => {
        if (effect !== current) return;
        navigation.hidden = !expanded;
        current.cancel(); effect = undefined;
      }).catch(() => {});
    };
    const close = (returnFocus: boolean, animate = true): void => {
      expanded = false; render(animate);
      if (returnFocus && mobile.matches) toggle.focus();
    };
    toggle.addEventListener('click', () => { expanded = !expanded; render(); });
    header.addEventListener('keydown', event => {
      if (event.key === 'Escape' && expanded && mobile.matches) { event.preventDefault(); close(true); }
    });
    navigation.addEventListener('click', event => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || !mobile.matches) return;
      close(false);
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        const hadTabindex = target.hasAttribute('tabindex');
        if (!hadTabindex) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (!hadTabindex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    });
    header.querySelector('.site-header__home')?.addEventListener('click', () => { if (mobile.matches && expanded) close(false); });
    document.addEventListener('pointerdown', event => {
      if (expanded && mobile.matches && event.target instanceof Node && !header.contains(event.target)) close(false);
    });
    mobile.addEventListener('change', () => close(false, false));
    reduced.addEventListener('change', () => render(false));
    header.dataset.navigationInitialized = 'true';
    render(false);
  }
}
