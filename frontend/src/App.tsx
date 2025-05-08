import React from 'react';
import { useRoutes } from 'react-router-dom';

import routes from './routes';

function App(): React.ReactElement | null {
  const routeElements = useRoutes(routes);
  return routeElements;
}

export default App;
