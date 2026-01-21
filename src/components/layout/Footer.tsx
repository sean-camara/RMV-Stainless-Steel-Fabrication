import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Studio', path: '/about' },
    { name: 'Capabilities', path: '/services' },
    { name: 'Work', path: '/portfolio' },
    { name: 'Client Portal', path: '/register' },
  ];

  const services = [
    'Custom Stainless Steel Fabrication',
    'Kitchen Counters',
    'Railings',
    'Cabinets',
    'Gates',
    'Residential Projects',
    'Small Commercial Projects',
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900">
      <div className="relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_-20%,_#334155,transparent_50%)]" />
        
        <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
            {/* Brand Section */}
            <div className="md:col-span-4 lg:col-span-5 pr-0 lg:pr-12">
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-14 w-14 rounded-2xl bg-white p-2 shadow-2xl flex items-center justify-center ring-1 ring-slate-800">
                  <img src="/1.jpg" alt="RMV Logo" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold tracking-tight">RMV Stainless Steel</h3>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-semibold">Fabrication</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md font-light">
                Specializing in stainless steel fabrication for gates, railings, and kitchen counters. 
                Providing custom metalwork solutions based on project requirements and client designs since 2008.
              </p>
              
              <div className="flex flex-col space-y-4">
                <div className="inline-flex items-center w-fit gap-2.5 rounded-full border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs text-slate-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Open for consultations
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Follow</span>
                  <a
                    href="https://www.facebook.com/profile.php?id=61574020349009"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                    aria-label="RMV Facebook"
                  >
                    <div className="h-10 w-10 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 group-hover:text-white group-hover:border-slate-600 group-hover:bg-slate-800 transition-all flex items-center justify-center">
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24h11.495v-9.294H9.691V11.01h3.13V8.309c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.505 0-1.796.715-1.796 1.763v2.312h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z" />
                      </svg>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Col */}
            <div className="md:col-span-2 lg:col-span-2">
              <h4 className="font-bold text-white text-[11px] uppercase tracking-[0.2em] mb-8">Navigation</h4>
              <ul className="space-y-4">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-slate-400 hover:text-white text-sm transition-colors font-light block w-fit"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Capabilities Col */}
            <div className="md:col-span-3 lg:col-span-2">
              <h4 className="font-bold text-white text-[11px] uppercase tracking-[0.2em] mb-8">Capabilities</h4>
              <ul className="space-y-4">
                {services.map((service) => (
                  <li key={service} className="text-slate-400 text-sm font-light leading-snug">
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            {/* Studio Col */}
            <div className="md:col-span-3 lg:col-span-3">
              <h4 className="font-bold text-white text-[11px] uppercase tracking-[0.2em] mb-8">Studio</h4>
              <ul className="space-y-6">
                <li className="flex items-start space-x-4 group">
                  <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-slate-400 text-sm font-light leading-relaxed">
                    BIR Village Novaliches, <br />
                    Quezon City, Philippines 1118
                  </span>
                </li>
                
                <li className="flex items-center space-x-4 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="text-slate-400 text-sm font-light">+63 945 285 2974</span>
                </li>

                <li className="flex items-center space-x-4 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-slate-400 text-sm font-light">rmvstainless@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900/60 bg-slate-950/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[11px] text-slate-600 uppercase tracking-widest font-medium text-center md:text-left">
              &copy; {currentYear} RMV Stainless Steel Fabrication. <br className="md:hidden" />
              All rights reserved.
            </p>
            
            <div className="flex items-center space-x-8">
              <Link
                to="/privacy-policy"
                className="text-[11px] uppercase tracking-widest text-slate-600 hover:text-white transition-colors font-bold"
              >
                Privacy Policy
              </Link>
              <div className="w-px h-3 bg-slate-800 hidden md:block" />
              <Link
                to="/terms-of-service"
                className="text-[11px] uppercase tracking-widest text-slate-600 hover:text-white transition-colors font-bold"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
