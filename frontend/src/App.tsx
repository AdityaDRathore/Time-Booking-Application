import { Routes, Route } from 'react-router-dom';

import MainLayout from './components/templates/MainLayout';

// Placeholder pages - will be implemented later
const HomePage = (): JSX.Element => <div>Home Page</div>;
const LoginPage = (): JSX.Element => <div>Login Page</div>;
const RegisterPage = (): JSX.Element => <div>Register Page</div>;

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
