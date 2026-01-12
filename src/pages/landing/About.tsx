import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const stats = [
    { value: '15+', label: 'Years of Experience' },
    { value: '500+', label: 'Projects Completed' },
    { value: '30+', label: 'Skilled Craftsmen' },
  ];

  const values = [
    {
      title: 'Uncompromising Quality',
      description: 'We never cut corners. We use genuine 304 and 316 grade stainless steel to ensure your investment lasts a lifetime.',
    },
    {
      title: 'Transparency',
      description: 'We provide detailed quotations and material specifications. No hidden costs, no surprise substitutions.',
    },
    {
      title: 'Integrity',
      description: 'We honor our timelines and commitments. Our word is as strong as the steel we fabricate.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section - Adjusted padding to balance spacing (approx 120px) */}
      <section className="pb-20 lg:pb-24 bg-white" style={{ paddingTop: '120px' }}>
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase mb-8 block">
            Since 2018
          </span>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-8 max-w-4xl mx-auto leading-tight">
            Forging Stronger Connections <br className="hidden md:block"/> through Steel.
          </h1>
          
          <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
            RMV Stainless Steel Fabrication started as a small family workshop in Valenzuela. Over the 
            last decade, we have grown into a premier provider of architectural and industrial metal-works, 
            trusted by top contractors and homeowners alike.
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="pb-24 lg:pb-32 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white p-12 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center hover:shadow-[0_15px_35px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-5xl font-bold text-slate-900 mb-4">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
            {/* Left Image */}
            <div className="w-full lg:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video lg:aspect-[4/3]">
                <img 
                  src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80" 
                  alt="Professional welder at work" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-slate-900/10"></div>
              </div>
            </div>

            {/* Right Content */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl font-bold text-slate-900 mb-12">Our Core Values</h2>
              
              <div className="space-y-10">
                {values.map((value, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                      <p className="text-slate-500 leading-relaxed text-base">
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
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to work with us?</h2>
          <p className="text-slate-500 mb-10 max-w-2xl mx-auto text-lg">
            Book a consultation today and let's discuss how we can bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/contact" className="bg-slate-900 text-white px-10 py-4 rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Book Appointment
            </Link>
            <Link to="/portfolio" className="bg-white text-slate-900 border border-slate-200 px-10 py-4 rounded-lg font-semibold hover:border-slate-300 transition-all hover:bg-slate-50">
              View Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
