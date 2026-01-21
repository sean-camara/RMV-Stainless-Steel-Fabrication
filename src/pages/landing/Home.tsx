import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-48 overflow-hidden bg-white">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-[1.1] tracking-tighter hero-fade-up hero-delay-2">
            Precision in <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900 bg-clip-text text-transparent bg-[length:200%_auto] animate-[hero-shimmer_4s_linear_infinite]">Stainless Steel.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light hero-fade-up hero-delay-3 px-4">
            Custom fabrication for residential and small commercial projects. 
            From gates to kitchen counters, we build based on project requirements.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 hero-fade-up hero-delay-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
            >
              Book an Appointment
            </Link>
            <Link
              to="/portfolio"
              className="w-full sm:w-auto px-10 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 transition-all"
            >
              View Samples
            </Link>
          </div>
        </div>

        {/* Abstract shapes for visual interest */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-slate-100 rounded-full blur-[100px] opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      </section>

      {/* Features Section */}
      <section className="py-32 relative bg-slate-900 text-white overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight hero-fade-up">Standard Workflow</h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-light hero-fade-up">
              Every project follows a structured process to ensure requirements are met according to design specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 overflow-visible">
            {/* Feature 1 */}
            <div className="group relative p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Quality Verification</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Fabrication follows approved drawings with material verification and structural checks before turnover.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Scheduled Execution</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Project timelines are communicated through the system portal, allowing for transparent progress tracking.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="group relative p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Project Close-out</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Formal turnover documentation and post-installation support strictly following project scoped requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Badge Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-3xl border border-slate-100 bg-slate-50/50 p-8 sm:p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Factual & Verified</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1">SS304</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Material Basis</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1">2008</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Established</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1">Project</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Orientation</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-1">Portal</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Management</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
