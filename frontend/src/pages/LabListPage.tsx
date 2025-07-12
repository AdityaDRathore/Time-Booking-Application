// src/pages/LabListPage.tsx
import React from 'react';
import LabList from '../components/organisms/LabList';

const LabListPage: React.FC = () => {
  return (
    <main className="bg-gray-100 min-h-screen text-black">
      <LabList />
    </main>
  );
};

export default LabListPage;
