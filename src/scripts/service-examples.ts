// Keep the same content in native details when JavaScript or dialog support is absent.
if (typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype) {
  document.querySelectorAll<HTMLElement>('[data-service-examples]').forEach((root) => {
    const trigger = root.querySelector<HTMLButtonElement>('[data-examples-open]');
    const fallback = root.querySelector<HTMLDetailsElement>('[data-examples-fallback]');
    const content = root.querySelector<HTMLElement>('[data-examples-content]');
    const dialog = root.querySelector<HTMLDialogElement>('[data-examples-dialog]');
    const close = root.querySelector<HTMLButtonElement>('[data-examples-close]');
    if (!trigger || !fallback || !content || !dialog || !close) return;

    dialog.append(content);
    fallback.hidden = true;
    trigger.hidden = false;

    let overflow: string | undefined;
    let startedOnBackdrop = false;
    trigger.addEventListener('click', () => {
      overflow = document.documentElement.style.overflow;
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
      dialog.scrollTop = 0;
      close.focus({ preventScroll: true });
    });
    const restorePage = () => {
      if (dialog.open || overflow === undefined) return;
      document.documentElement.style.overflow = overflow;
      overflow = undefined;
      trigger.focus({ preventScroll: true });
    };
    const dismiss = () => {
      dialog.close();
      restorePage();
    };
    close.addEventListener('click', dismiss);
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      dismiss();
    });
    dialog.addEventListener('close', restorePage);

    // Both ends must be outside, so dragging from content to the backdrop never dismisses it.
    const isBackdrop = (event: PointerEvent | MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.target === dialog &&
        (event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom)
      );
    };
    dialog.addEventListener('pointerdown', (event) => {
      startedOnBackdrop = isBackdrop(event);
    });
    dialog.addEventListener('click', (event) => {
      if (startedOnBackdrop && isBackdrop(event)) dismiss();
      startedOnBackdrop = false;
    });
  });
}
