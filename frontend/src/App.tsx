import React, { useEffect, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes';
import { useAuthStore } from './state/authStore';

function App(): React.ReactElement | null {
  const [isHydrated, setIsHydrated] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    // Zustand persist takes time to rehydrate from localStorage
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // fallback: hydration done immediately (for SSR-safe fallback)
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => unsub?.();
  }, []);

  const routeElements = useRoutes(routes);

  if (!isHydrated) return null; // prevent white flash, wait until hydration

  return routeElements;
}
console.log('Hydrated?', useAuthStore.persist.hasHydrated());

export default App;
