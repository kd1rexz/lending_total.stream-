/** Navigation is visible in the server HTML. Collapsing is a progressive enhancement. */
export function initNavigation(): void {
  const headers = document.querySelectorAll<HTMLElement>('[data-site-header]');

  for (const header of headers) {
    if (header.dataset.navigationInitialized === 'true') continue;
    const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
    const navigation = header.querySelector<HTMLElement>('[data-navigation]');
    const label = toggle?.querySelector<HTMLElement>('[data-menu-label]');
    if (!toggle || !navigation || !label) continue;

    const mobile = window.matchMedia('(max-width: 63.999rem)');
    let expanded = false;

    const render = (): void => {
      toggle.hidden = !mobile.matches;
      navigation.hidden = mobile.matches && !expanded;
      toggle.setAttribute('aria-expanded', String(expanded));
      label.textContent = expanded ? 'Закрыть' : 'Меню';
    };

    const close = (returnFocus: boolean): void => {
      expanded = false;
      render();
      if (returnFocus && mobile.matches) toggle.focus();
    };

    toggle.addEventListener('click', () => {
      expanded = !expanded;
      render();
    });

    header.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && expanded && mobile.matches) {
        event.preventDefault();
        close(true);
      }
    });

    navigation.addEventListener('click', (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || !mobile.matches) return;
      close(false);

      // Do not leave keyboard focus inside the collapsed navigation.
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        const hadTabindex = target.hasAttribute('tabindex');
        if (!hadTabindex) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (!hadTabindex) {
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
      }
    });

    mobile.addEventListener('change', () => close(false));
    header.dataset.navigationInitialized = 'true';
    render();
  }
}
