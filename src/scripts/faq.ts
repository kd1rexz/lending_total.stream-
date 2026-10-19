document.querySelectorAll<HTMLDetailsElement>('.faq__item').forEach(item => {
  const summary = item.querySelector('summary');
  const answer = item.querySelector<HTMLElement>('.faq__answer');
  if (!summary || !answer) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let expanded = item.open;
  let animation: Animation | undefined;
  let answerAnimation: Animation | undefined;
  const finish = () => {
    animation?.cancel();
    answerAnimation?.cancel();
    animation = undefined;
    answerAnimation = undefined;
    item.open = expanded;
    delete item.dataset.closing;
    item.style.removeProperty('height');
    item.style.removeProperty('overflow');
  };
  summary.addEventListener('click', event => {
    event.preventDefault();
    const from = item.getBoundingClientRect().height;
    const wasOpen = item.open;
    const answerStyle = getComputedStyle(answer);
    const opacity = wasOpen ? answerStyle.opacity : '0';
    const transform = wasOpen ? answerStyle.transform : 'translateX(12px)';
    animation?.cancel();
    answerAnimation?.cancel();
    expanded = !expanded;
    if (reduced.matches) { finish(); return; }
    item.open = true;
    item.toggleAttribute('data-closing', !expanded);
    item.style.height = 'auto';
    const to = expanded ? item.getBoundingClientRect().height : summary.offsetHeight;
    item.style.overflow = 'hidden';
    answerAnimation = answer.animate([
      { opacity, transform },
      { opacity: expanded ? '1' : '0', transform: expanded ? 'translateX(0)' : 'translateX(12px)' },
    ], { duration: 420, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'both' });
    const effect = item.animate([{ height: `${from}px` }, { height: `${to}px` }], {
      duration: 460, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'both',
    });
    animation = effect;
    effect.finished.then(() => { if (animation === effect) finish(); }).catch(() => {});
  });
  reduced.addEventListener('change', finish);
  window.addEventListener('resize', () => { if (animation) finish(); });
});
