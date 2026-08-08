type LenisLike = {
  scrollTo: (
    target: HTMLElement | number | string,
    options?: { offset?: number; duration?: number; immediate?: boolean; force?: boolean },
  ) => void;
  resize?: () => void;
};

declare global {
  interface Window {
    __lenis?: LenisLike;
  }
}

export const PENDING_SECTION_KEY = 'pending-section';

export function setPendingSection(id: string) {
  try {
    sessionStorage.setItem(PENDING_SECTION_KEY, id);
  } catch {
    // ignore private-mode / blocked storage
  }
}

export function consumePendingSection() {
  try {
    const id = sessionStorage.getItem(PENDING_SECTION_KEY);
    if (id) sessionStorage.removeItem(PENDING_SECTION_KEY);
    return id;
  } catch {
    return null;
  }
}

function preferReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Only rewrite the hash while already on the homepage — never fake a `/` route via pushState. */
function syncHomeHash(id: string) {
  if (window.location.pathname !== '/') return;
  const next = `/#${id}`;
  if (`${window.location.pathname}${window.location.hash}` === next) return;
  window.history.pushState(null, '', next);
}

export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  // Guard: scrolling/hash updates belong on the long homepage only.
  if (window.location.pathname !== '/') return false;

  const smooth = behavior === 'smooth' && !preferReducedMotion();
  const lenis = window.__lenis;
  lenis?.resize?.();

  if (id === 'home') {
    if (lenis) {
      lenis.scrollTo(0, { offset: 0, duration: smooth ? 1.15 : 0, immediate: !smooth, force: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: smooth ? 'smooth' : 'auto' });
    }
    syncHomeHash('home');
    return true;
  }

  const section = document.getElementById(id);
  if (!section) return false;

  const top = section.getBoundingClientRect().top + window.scrollY;

  if (lenis) {
    lenis.scrollTo(top, { offset: 0, duration: smooth ? 1.15 : 0, immediate: !smooth, force: true });
  } else {
    window.scrollTo({ top, left: 0, behavior: smooth ? 'smooth' : 'auto' });
  }

  syncHomeHash(id);
  return true;
}

/** Retry a few times — layout/Lenis may not be ready on first paint after route change. */
export function scrollToSectionWhenReady(id: string, behavior: ScrollBehavior = 'smooth') {
  const delays = [0, 50, 150, 350, 700];
  delays.forEach(delay => {
    window.setTimeout(() => {
      scrollToSection(id, behavior);
    }, delay);
  });
}
