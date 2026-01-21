import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-20 lg:py-24 bg-white" style={{ paddingTop: '120px' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-8 leading-tight hero-fade-up hero-delay-1">
            Terms of Service
          </h1>
          
          <div className="prose prose-slate max-w-none hero-fade-up hero-delay-2">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 md:p-12 shadow-sm">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                This web-based system is a prototype developed for academic research purposes. 
                By accessing this system, you acknowledge its status as a thesis project demonstration.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Usage Policy</h2>
                  <p className="text-slate-600 leading-relaxed">
                    This system is not intended for commercial deployment or public use. 
                    Its functionality is presented "as is" for the purpose of technical 
                    evaluation and academic defense.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Limited Use</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Use of this system is limited to demonstration, testing, and evaluation related
                    to the thesis requirements of the developers. Commercial transactions or 
                    contractual obligations are not supported by this prototype.
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

export default TermsOfService;
