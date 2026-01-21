import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-20 lg:py-24 bg-white" style={{ paddingTop: '120px' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-8 leading-tight hero-fade-up hero-delay-1">
            Privacy Policy
          </h1>
          
          <div className="prose prose-slate max-w-none hero-fade-up hero-delay-2">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 md:p-12 shadow-sm">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                This system is developed for academic purposes only as part of a thesis project. 
                Our approach to data management reflects its status as a research prototype.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Data Collection & Storage</h2>
                  <p className="text-slate-600 leading-relaxed">
                    No real personal data is collected, stored, or shared outside the scope of system
                    demonstration and testing. Any information entered during the use of this prototype 
                    is used solely for demonstrating the system's capabilities.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Academic Evaluation</h2>
                  <p className="text-slate-600 leading-relaxed">
                    All sample user data shown in the system is fictional and used solely for academic
                    evaluation. This includes names, addresses, and contact details used in the 
                    project demonstration.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-500 italic">
                    Last updated: January 21, 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
