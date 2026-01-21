import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const LandingLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="landing-orb landing-orb--one" />
        <div className="landing-orb landing-orb--two" />
        <div className="landing-orb landing-orb--three" />
      </div>
      <Header />
      <main className="flex-grow relative z-10 landing-page">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
