import {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';

/** Keep existing fragment links usable when their headings are inside details. */
export default function RevealAnchoredDetails(): null {
  const location = useLocation();

  useEffect(() => {
    let frame = 0;
    let disposed = false;
    const reveal = () => {
      cancelAnimationFrame(frame);
      if (!/\/docs\/preview(?:\/|$)/.test(window.location.pathname) || !window.location.hash) return;
      const hash = window.location.hash;
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
      const opened = new Set<HTMLDetailsElement>();
      const deadline = performance.now() + 5000;
      const step = () => {
        if (disposed || window.location.hash !== hash || performance.now() > deadline) return;
        const target = document.getElementById(id);
        if (!target) { frame = requestAnimationFrame(step); return; }
        const parents: HTMLDetailsElement[] = [];
        for (let detail = target.closest('details'); detail; detail = detail.parentElement?.closest('details') ?? null) {
          parents.unshift(detail);
        }
        for (const detail of parents) {
          // Clicking the summary also updates Docusaurus' collapsible state.
          // Setting the native open attribute alone leaves its content hidden.
          if ((!detail.open || detail.dataset.collapsed === 'true') && !opened.has(detail)) {
            opened.add(detail);
            detail.querySelector<HTMLElement>(':scope > summary')?.click();
            frame = requestAnimationFrame(step);
            return;
          }
          const content = detail.querySelector<HTMLElement>(':scope > div');
          if (!detail.open || detail.dataset.collapsed === 'true' ||
              (content && (content.style.height !== 'auto' || getComputedStyle(content).display === 'none'))) {
            frame = requestAnimationFrame(step);
            return;
          }
        }
        if (!target.getBoundingClientRect().height) { frame = requestAnimationFrame(step); return; }
        target.scrollIntoView({block: 'start', behavior: 'instant'});
      };
      frame = requestAnimationFrame(step);
    };
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || (anchor.target && anchor.target !== '_self')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash) {
        // Same-fragment clicks may not produce a router or hashchange event.
        frame = requestAnimationFrame(reveal);
      }
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    document.addEventListener('click', onClick);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', reveal);
      document.removeEventListener('click', onClick);
    };
  }, [location.pathname, location.hash, location.key]);
  return null;
}
