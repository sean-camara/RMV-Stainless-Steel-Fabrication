import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const values = [
    {
      title: 'Quality Workmanship',
      description: 'RMV focuses on careful fabrication and proper handling of stainless steel based on approved designs and project requirements.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: 'Transparency',
      description: 'Project details, cost breakdowns, and design specifications are clearly presented to clients before fabrication begins.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      title: 'Technical Precision',
      description: 'RMV follows agreed project workflows and communicates with clients regarding schedules, revisions, and project status.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      )
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pb-24 lg:pb-32 overflow-hidden" style={{ paddingTop: '120px' }}>
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-8 max-w-5xl mx-auto leading-[1.1] tracking-tighter hero-fade-up">
            Our Studio and Process
          </h1>
          
          <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-light hero-fade-up hero-delay-2">
            Providing custom stainless steel solutions for residential and small commercial clients in Valenzuela City through technical precision and transparent management.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
            {/* Left Image with Decorative Frame */}
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute -inset-4 border border-slate-200 rounded-3xl -rotate-2 z-0 opacity-50" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video lg:aspect-[4/5] hero-fade-up z-10">
                <img 
                  src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80" 
                  alt="Professional welder at work" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/10 transition-opacity hover:opacity-0" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white p-4 rounded-2xl shadow-xl z-20 hidden md:block border border-slate-100 hero-fade-up hero-delay-3">
                <div className="h-full w-full rounded-xl bg-slate-50 flex flex-col items-center justify-center p-4">
                   <p className="text-4xl font-bold text-slate-900 leading-none">15+</p>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2 text-center">Years of Fabrication</p>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight hero-fade-up">Core Principles</h2>
              <p className="text-slate-500 mb-16 font-light hero-fade-up hero-delay-1">
                Our approach to stainless steel fabrication is built on the following professional standards.
              </p>
              
              <div className="space-y-12">
                {values.map((value, index) => (
                  <div key={index} className="flex gap-8 hero-fade-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200/50 flex items-center justify-center text-slate-900 group shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)]">
                        {value.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-light">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-32 bg-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
             
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-slate-900 mb-8 tracking-tight hero-fade-up">Project Consultation</h2>
          <p className="text-slate-500 mb-12 max-w-2xl mx-auto text-lg font-light hero-fade-up hero-delay-1">
            Book an office consultation to discuss project requirements, material specifications, and design workflows.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 hero-fade-up hero-delay-2">
            <Link to="/register" className="bg-slate-900 text-white px-12 py-5 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-1">
              Book Appointment
            </Link>
            <Link to="/portfolio" className="bg-white text-slate-900 border border-slate-200 px-12 py-5 rounded-xl font-medium hover:border-slate-800 transition-all hover:bg-slate-50">
              View Sample Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
