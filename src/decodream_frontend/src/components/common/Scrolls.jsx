import { useEffect } from "react";
import { useLocation } from "react-router";

const scrollTo = (target, options = {}) => {
  if (!window.lenis) return;
  
  const defaultOptions = {
    offset: 0,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  if (typeof target === 'string') {
    const element = document.querySelector(target);
    if (element) {
      window.lenis.scrollTo(element, mergedOptions);
    }
  } else if (typeof target === 'number') {
    window.lenis.scrollTo(target, mergedOptions);
  } else if (target instanceof HTMLElement) {
    window.lenis.scrollTo(target, mergedOptions);
  }
};

const scrollToTop = (options = {}) => {
  scrollTo(0, options);
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleLoad = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return null;
};

export { scrollTo, scrollToTop, ScrollToTop } ;
