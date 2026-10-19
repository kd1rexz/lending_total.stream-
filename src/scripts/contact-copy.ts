document.querySelectorAll<HTMLElement>('.contact-variants').forEach(root => {
  const status = root.querySelector<HTMLElement>('[data-copy-status]');
  if (!navigator.clipboard?.writeText) return;
  root.querySelectorAll<HTMLButtonElement>('[data-contact-copy]').forEach(button => {
    button.hidden = false;
    let reset: ReturnType<typeof setTimeout> | undefined;
    button.addEventListener('click', async () => {
      const label = button.dataset.copyName ?? 'Контакт';
      try {
        await navigator.clipboard.writeText(button.dataset.contactCopy ?? '');
        clearTimeout(reset);
        button.setAttribute('data-copied', '');
        button.setAttribute('aria-label', `Скопировано: ${label}`);
        button.title = `Скопировано: ${label}`;
        if (status) status.textContent = `${label}: скопировано`;
        reset = setTimeout(() => {
          button.removeAttribute('data-copied');
          button.setAttribute('aria-label', `Скопировать: ${label}`);
          button.title = `Скопировать: ${label}`;
          if (status) status.textContent = '';
        }, 1800);
      } catch {
        if (status) status.textContent = 'Не удалось скопировать. Выделите контакт и скопируйте вручную.';
      }
    });
  });
});
