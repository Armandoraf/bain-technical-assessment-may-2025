import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

export function useClearQueryOnReload() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const navEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;

    const wasReload =
      navEntry?.type === 'reload' || performance.navigation.type === 1;

    if (wasReload && location.search) {
      navigate(location.pathname, { replace: true });
    }
  }, []);
}
