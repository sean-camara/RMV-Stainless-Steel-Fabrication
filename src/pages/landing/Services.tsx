import React from 'react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
  const services = [
    {
      title: 'Residential Fabrication',
      description: 'Elevate your home\'s aesthetic and security with custom-designed gates, railings, and window grills.',
      features: [
        'Main & Pedestrian Gates',
        'Balcony Railings',
        'Decorative Grills',
        'Staircases',
      ],
      icon: (
        <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: 'Commercial Kitchen',
      description: 'Food-grade 304 stainless steel solutions for restaurants, hotels, and commissaries.',
      features: [
        'Prep Tables & Sinks',
        'Exhaust Hoods',
        'Storage Racks',
        'Grease Traps',
      ],
      icon: (
        <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      title: 'Architectural & Commercial',
      description: 'Heavy-duty installations for malls, offices, and public spaces designed for high traffic.',
      features: [
        'Mall Railings',
        'Cladding',
        'Signage Frames',
        'Column Covers',
      ],
      icon: (
        <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Design & Consultation', // Changed from Duplicate "Residential Fabrication" to reflect the Pen Nib Icon
      description: 'Professional engineering services to bring your vision to life with precision and safety.',
      features: [
        'CAD Drafting',
        'Structural Analysis',
        'Material Specification',
        'Project Costing',
      ],
      icon: (
        <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
  ];

  const steps = [
    {
      id: 1,
      title: 'Book Appointment',
      subtitle: 'Schedule a visit',
    },
    {
      id: 2,
      title: 'Design & Quote',
      subtitle: 'Receive CAD Drawings and cost estimates',
    },
    {
      id: 3,
      title: 'Fabrication',
      subtitle: 'We build your project in our workshop',
    },
    {
      id: 4,
      title: 'Installation',
      subtitle: 'Professional setup and turnover',
    },
  ];

  return (
    <div className="bg-white">
      {/* Header Section - Inline padding to ensure clearance from fixed header */}
      <section className="pb-24 lg:pb-32 bg-white text-center" style={{ paddingTop: '120px' }}>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Precision Engineering. <br />
            Limitless Possibilities.
          </h1>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto">
            We combine advanced fabrication technology with artisanal craftsmanship to deliver superior stainless steel products.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 h-12">
                  {service.description}
                </p>
                <ul className="space-y-4">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-700 font-medium text-sm">
                      <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-400 mb-20">From concept to installation in 4 simple steps.</p>

          <div className="relative max-w-6xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-[2.5rem] left-0 right-0 h-0.5 bg-slate-800 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-2xl font-bold mb-8 shadow-xl">
                    {step.id}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm max-w-[200px] leading-relaxed">
                    {step.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
