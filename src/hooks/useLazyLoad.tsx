
import { useState, useEffect, useRef, useCallback } from 'react';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useLazyLoad(options: LazyLoadOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    enabled = true
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const load = useCallback(() => {
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsIntersecting(true);
          load();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, threshold, rootMargin, hasLoaded, load]);

  return {
    ref,
    isIntersecting,
    hasLoaded,
    load
  };
}
