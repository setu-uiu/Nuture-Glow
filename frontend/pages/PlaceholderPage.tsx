import React from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { SmoothScrollProvider } from '../components/landing/SmoothScrollProvider';
import { Reveal } from '../components/landing/motion/Reveal';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#F7F5EF]">
        <Navbar />
        <main className="pt-40 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Reveal>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">{title}</h1>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="p-12 bg-white rounded-[48px] shadow-sm border border-gray-100">
                <p className="text-xl text-gray-500 italic">Content coming soon.</p>
                <div className="mt-8 h-1 w-20 bg-[#E6C77A] mx-auto rounded-full opacity-30"></div>
              </div>
            </Reveal>
          </div>
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
};

export default PlaceholderPage;