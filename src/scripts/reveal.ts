// Content is visible before JS. Motion is an optional enhancement, never a gate.
if (
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  'IntersectionObserver' in window
) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.animate(
          [
            { opacity: 0.35, transform: 'translateY(16px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 500, easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)' },
        );
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.08 },
  );
  document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
}
