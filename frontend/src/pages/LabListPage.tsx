// src/pages/LabListPage.tsx
import React from 'react';
import { Monitor, Users, Shield, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllLabs } from '../api/labs';
import LabList from '../components/organisms/LabList';

const LabListPage: React.FC = () => {
  const { data: labs = [], isLoading, error } = useQuery({
    queryKey: ['labs'],
    queryFn: getAllLabs,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full mb-6">
              <Shield className="w-5 h-5 mr-2" />
              <span className="font-semibold">Digital Lab Network</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Available Coding Labs
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Discover and book your preferred digital coding lab from our network of modern facilities
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Feature icon={<Monitor />} title="Modern Equipment" text="State-of-the-art computers and software" />
              <Feature icon={<Users />} title="Expert Support" text="Qualified instructors and technical support" />
              <Feature icon={<BookOpen />} title="Free Access" text="Completely free for all students" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-100 to-green-100 p-6 border-b">
            <div className="flex items-center">
              <Monitor className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Browse All Labs</h2>
                <p className="text-gray-600">Select a lab to view details and book your session</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <p className="text-center text-gray-600">Loading labs...</p>
            ) : error ? (
              <p className="text-center text-red-600">Failed to load labs.</p>
            ) : (
              <LabList labs={labs} /> // ✅ Correct usage
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LabListPage;

// Optional: clean feature card
const Feature = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="bg-white/20 rounded-lg p-6 text-center">
    <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-3">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-white/80 text-sm">{text}</p>
  </div>
);
