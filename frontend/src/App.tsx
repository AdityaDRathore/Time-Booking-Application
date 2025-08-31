import React, { useEffect, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes';
import { useAuthStore } from './state/authStore';

function App(): React.ReactElement | null {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => unsub?.();
  }, []);

  const routeElements = useRoutes(routes);

  if (!isHydrated) return null;

  return routeElements;
}

export default App;
