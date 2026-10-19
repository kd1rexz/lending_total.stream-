const cue = document.querySelector<HTMLElement>('.hero__explore');
if (cue) {
  const rect = cue.getBoundingClientRect();
  const style = getComputedStyle(cue);
  // Reserve a stable, noninteractive anchor before moving the cue once at startup.
  // Nothing is reparented or taken out of layout when scrolling/reversing.
  const anchor = document.createElement('span');
  anchor.setAttribute('aria-hidden', 'true');
  anchor.style.cssText = `display:block;flex:0 0 auto;width:${rect.width}px;height:${rect.height}px`;
  cue.before(anchor);
  cue.style.fontFamily = style.fontFamily;
  cue.style.fontSize = style.fontSize;
  cue.style.fontWeight = style.fontWeight;
  cue.style.lineHeight = style.lineHeight;
  const position = () => {
    const slot = anchor.getBoundingClientRect();
    const top = slot.top + scrollY;
    cue.style.setProperty('--cue-top', `${top}px`);
    cue.style.setProperty('--cue-left', `${slot.left}px`);
    cue.style.setProperty('--cue-width', `${slot.width}px`);
    cue.style.setProperty('--cue-exit-distance', `${Math.max(0, innerHeight - top - slot.height / 2)}px`);
  };
  position();
  cue.setAttribute('data-viewport', '');
  document.body.append(cue);
  let previousY = Math.max(0, scrollY);
  cue.toggleAttribute('data-dismissed', previousY > 4);
  const update = () => {
    const y = Math.max(0, scrollY);
    if (y <= 4 || (y < previousY && y <= 96)) {
      cue.removeAttribute('data-dismissed');
    } else if (y > previousY && y > 4) {
      cue.setAttribute('data-dismissed', '');
    }
    previousY = y;
  };
  // Commit the initial fixed state before enabling transitions.
  requestAnimationFrame(() => requestAnimationFrame(() => cue.setAttribute('data-cue-ready', '')));
  addEventListener('scroll', update, { passive: true });
  addEventListener('pageshow', () => { position(); update(); });
  addEventListener('resize', position, { passive: true });
}
