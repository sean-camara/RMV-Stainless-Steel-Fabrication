import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-50 border border-slate-200 mb-8">
            <svg className="w-4 h-4 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Trusted by 500+ Homeowners</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
            Crafting Elegance in <br className="hidden md:block"/>
            <span className="text-slate-400">Stainless Steel.</span>
          </h1>
          
          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Premium custom fabrication for gates, railings, and architectural details. Experience a 
            seamless digital booking process from design to installation.
          </p>
          
          <div>
            <Link
              to="/register"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-lg font-light text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Book an appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pb-24 pt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-3">Premium 304 Grade</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light">
                We use only authentic 304 grade stainless steel for maximum corrosion resistance and longevity.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                 <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-3">Timely Delivery</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light">
               Rigorous project management ensures your installation happens exactly when scheduled.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                 <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-3">Warranty Guaranteed</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light">
                Every project comes with our signature workmanship warranty for your peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
