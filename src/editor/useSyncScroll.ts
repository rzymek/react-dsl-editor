import { useCallback, UIEvent, RefObject } from 'react';

export function useSyncScroll<Target extends HTMLElement, Source extends HTMLElement>(...targets: RefObject<Target | null>[]) {
  return useCallback((e: UIEvent<Source>) => {
    const source = e.currentTarget;
    targets.forEach(target => {
      if (target.current && source) {
        target.current.scrollTop = source.scrollTop;
        target.current.scrollLeft = source.scrollLeft;
      }
    });
  }, [targets]);
}
