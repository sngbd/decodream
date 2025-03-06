import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

const SmoothScroll = ({ children }) => {
  const lenisRef = useRef(null);
  
  useEffect(() => {
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    const pageWasReloaded = () => {
      if (performance.getEntriesByType && performance.getEntriesByType('navigation').length) {
        const navEntries = performance.getEntriesByType('navigation');
        return navEntries[0].type === 'reload';
      }
      
      return document.readyState === 'complete';
    };

    if (pageWasReloaded()) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    
    const raf = (time) => {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    };
    
    requestAnimationFrame(raf);
    
    return () => {
      lenisRef.current?.destroy();
    };
  }, []);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.lenis = lenisRef.current;
    }
  }, []);

  return children;
};

export default SmoothScroll;
