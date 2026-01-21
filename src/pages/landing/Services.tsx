import React from 'react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
  const services = [
    {
      title: 'Residential Fabrication',
      description: 'Custom fabrication of kitchen counters, gates, railings, cabinets, and similar stainless steel works for residential clients.',
      features: [
        'Kitchen Counters',
        'Gates and Railings',
        'Cabinets',
        'Custom Fixtures',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: 'Small Commercial Fabrication',
      description: 'Stainless steel fabrication for small businesses such as counters, racks, and custom fixtures.',
      features: [
        'Commercial Counters',
        'Display Racks',
        'Custom Worktables',
        'Utility Shelving',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Design and Costing',
      description: 'Preparation of project designs and cost estimates based on customer requirements and approved measurements.',
      features: [
        'Project Design Drawings',
        'Material Cost Estimation',
        'Formal Quotation',
        'Measurement Verification',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
  ];

  const steps = [
    {
      id: 1,
      title: 'Book Appointment',
      subtitle: 'Schedule an office consultation or ocular visit.',
    },
    {
      id: 2,
      title: 'Design & Costing',
      subtitle: 'Preparation of project design and cost estimates based on approved measurements.',
    },
    {
      id: 3,
      title: 'Fabrication',
      subtitle: 'Fabrication of stainless steel components based on approved designs.',
    },
    {
      id: 4,
      title: 'Installation',
      subtitle: 'On-site installation and project completion.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="relative pb-24 lg:pb-32 bg-white text-center overflow-hidden" style={{ paddingTop: '120px' }}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
             
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-8 tracking-tighter leading-[1.1] hero-fade-up">
            Fabrication <br className="hidden md:block" /> Capabilities
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto font-light hero-fade-up hero-delay-2">
            Providing custom stainless steel fabrication and design services based on professional technical requirements.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white p-8 sm:p-12 rounded-[2rem] border border-slate-200/50 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 hero-fade-up"
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
              >
                <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-10 min-h-[3rem] font-light">
                  {service.description}
                </p>
                <ul className="space-y-4 pt-8 border-t border-slate-100">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-700 font-medium text-xs tracking-wide">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Workflow Section */}
      <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '120px 120px' }} />
             
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight hero-fade-up">Project Workflow</h2>
          <p className="text-slate-400 mb-24 max-w-2xl mx-auto font-light hero-fade-up">A documented four-step process for systematic project execution.</p>

          <div className="relative max-w-7xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-[2.5rem] left-0 right-0 h-px bg-white/10 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="group flex flex-col items-center hero-fade-up"
                  style={{ animationDelay: `${0.2 + step.id * 0.08}s` }}
                >
                  <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 border border-white/20 flex items-center justify-center text-2xl font-bold mb-10 shadow-2xl group-hover:bg-white group-hover:text-slate-950 transition-all duration-500 group-hover:rotate-6">
                    {step.id}
                  </div>
                  <h3 className="text-xl font-bold mb-4 tracking-tight">{step.title}</h3>
                  <p className="text-slate-400 text-sm max-w-[220px] leading-relaxed font-light">
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
