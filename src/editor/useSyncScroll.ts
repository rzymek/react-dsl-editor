import { useCallback, UIEvent, RefObject } from 'react';

export function useSyncScroll<Target extends HTMLElement, Source extends HTMLElement>(target: RefObject<Target | null>) {
  return useCallback((e: UIEvent<Source>) => {
    const source = e.currentTarget;
    if (target.current && source) {
      // eslint-disable-next-line react-hooks/immutability
      target.current.scrollTop = source.scrollTop;
      target.current.scrollLeft = source.scrollLeft;
    }
  }, [target]);
}
