import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Time-Booking Application</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>

      <footer className="bg-gray-100 p-4">
        <div className="container mx-auto text-center text-gray-500">
          &copy; {new Date().getFullYear()} Time-Booking Application
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
