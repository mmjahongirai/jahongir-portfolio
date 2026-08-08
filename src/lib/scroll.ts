type LenisLike = {
  scrollTo: (
    target: HTMLElement | number | string,
    options?: { offset?: number; duration?: number; immediate?: boolean },
  ) => void;
};

declare global {
  interface Window {
    __lenis?: LenisLike;
  }
}

export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const section = document.getElementById(id);
  if (!section) return false;

  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(section, {
      offset: 0,
      duration: behavior === 'smooth' ? 1.15 : 0,
      immediate: behavior !== 'smooth',
    });
  } else {
    section.scrollIntoView({ behavior, block: 'start' });
  }

  if (window.location.hash !== `#${id}`) {
    window.history.pushState(null, '', `/#${id}`);
  }

  return true;
}

export function scrollToHash(behavior: ScrollBehavior = 'smooth') {
  const id = window.location.hash.replace(/^#/, '');
  if (!id) return false;
  return scrollToSection(id, behavior);
}
