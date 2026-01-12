import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Studio', path: '/about' },
    { name: 'Capabilities', path: '/services' },
    { name: 'Work', path: '/portfolio' },
  ];

  const services = [
    'Structural Steel',
    'Automated Entries',
    'Industrial Solutions',
    'Architectural Metal',
    'Custom Fabrication',
  ];

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-8 w-8 bg-white text-slate-900 flex items-center justify-center font-bold text-sm tracking-tighter">RMV</div>
              <span className="font-light text-white tracking-widest uppercase text-sm">Engineering</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-light">
              Precision engineering and architectural metalwork. Defining spaces through 
              structural integrity and minimalist design since 2008.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-white text-sm uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-500 hover:text-white text-sm transition-colors font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/register"
                  className="text-slate-500 hover:text-white text-sm transition-colors font-light"
                >
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-medium text-white text-sm uppercase tracking-widest mb-6">Capabilities</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service} className="text-slate-500 text-sm font-light">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-medium text-white text-sm uppercase tracking-widest mb-6">Studio</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="text-slate-500 text-sm font-light leading-relaxed">
                  123 Industrial Ave, <br />
                  Metro Manila, Philippines
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-slate-500 text-sm font-light">+63 912 345 6789</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-slate-500 text-sm font-light">hello@rmv-engineering.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 font-light">
          <p>&copy; {currentYear} RMV Engineering. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="cursor-pointer hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-slate-400 transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
