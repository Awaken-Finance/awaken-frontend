import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useMonitorScroll = (monitorClassName?: string) => {
  const pathname = useLocation().pathname;

  const registerScroll = useCallback(() => {
    const navbar = document.querySelector('.site-header');
    const monitorContent = monitorClassName ? document.querySelector(`.${monitorClassName}`) : window;

    const measureContent = document.querySelector(`.pc-site-content`);
    if (!monitorContent || !navbar) return;

    const listener = () => {
      const top =
        monitorContent !== window
          ? (monitorContent as Element).scrollTop
          : 0 - (measureContent?.getBoundingClientRect().top || 0);

      if (top > 0) {
        if (navbar.classList.contains('site-header-border')) return;
        navbar.classList.add('site-header-border');
      } else {
        navbar.classList.remove('site-header-border');
      }
    };
    monitorContent.addEventListener('scroll', listener);
    listener();

    return () => {
      monitorContent.removeEventListener('scroll', listener);
      navbar.classList.remove('site-header-border');
    };
  }, [monitorClassName]);

  useEffect(() => {
    console.log('pathname change', pathname);
    return registerScroll();
  }, [pathname, registerScroll]);
};
