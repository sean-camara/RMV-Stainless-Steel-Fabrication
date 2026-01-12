import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type Category = 'all' | 'gates' | 'railings' | 'kitchen' | 'stairs' | 'grills' | 'commercial';

interface Project {
  id: number;
  title: string;
  location: string;
  category: Category;
  categoryLabel: string;
  image: string;
}

const Portfolio: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const categories: { value: Category; label: string; icon?: React.ReactNode }[] = [
    { value: 'all', label: 'All' },
    { value: 'gates', label: 'Gates' },
    { value: 'railings', label: 'Railings' },
    { 
      value: 'kitchen', 
      label: 'Kitchen', 
      icon: (
        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    { value: 'stairs', label: 'Stairs' },
    { value: 'grills', label: 'Grills' },
    { value: 'commercial', label: 'Commercial' },
  ];

  const projects: Project[] = [
    {
      id: 1,
      title: 'Modern Automated Driveway Gate',
      location: 'Forbes Park Makati',
      category: 'gates',
      categoryLabel: 'GATES',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80', // Modern House Gate
    },
    {
      id: 2,
      title: 'Industrial Kitchen Setup',
      location: 'BGC Restaurant Group',
      category: 'kitchen',
      categoryLabel: 'KITCHEN',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80', // Tried & Tested Kitchen
    },
    {
      id: 3,
      title: 'Floating Steel Staircase',
      location: 'Ayala Alabang Village',
      category: 'stairs',
      categoryLabel: 'STAIRS',
      image: 'https://images.unsplash.com/photo-1522050212171-61b01dd24579?auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      title: 'Glass & Steel Balcony',
      location: 'Serendra Condominium',
      category: 'railings',
      categoryLabel: 'RAILINGS',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80',
    },
    {
      id: 5,
      title: 'Commercial Building Cladding',
      location: 'Makati CBD Office Tower',
      category: 'commercial',
      categoryLabel: 'COMMERCIAL',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
    },
    {
      id: 6,
      title: 'Decorative Security Grills',
      location: 'Greenhills Residential',
      category: 'grills',
      categoryLabel: 'GRILLS',
      image: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&q=80',
    },
        {
      id: 7,
      title: 'Automated Swing Gate',
      location: 'Dasmarinas Village',
      category: 'gates',
      categoryLabel: 'GATES',
      image: 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&q=80', // Home Exterior
    },
    {
      id: 8,
      title: 'Restaurant Exhaust Hood',
      location: 'Quezon City Commercial',
      category: 'kitchen',
      categoryLabel: 'KITCHEN',
      image: 'https://images.unsplash.com/photo-1590791182857-9cf6a27778b4?auto=format&fit=crop&q=80', // Kitchen Interior
    },
    {
      id: 9,
      title: 'Minimalist Balcony Guard',
      location: 'Rockwell Center',
      category: 'railings',
      categoryLabel: 'RAILINGS',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80',
    },
  ];

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <section className="bg-white text-center px-4" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <p className="text-slate-500 font-bold tracking-[0.2em] uppercase mb-4 text-xs">
          Our Masterpieces
        </p>
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
          Designed to Impress.<br />Built to Last.
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Explore our collection of custom stainless steel fabrications, from food-grade kitchen installations to heavy-duty architectural gates.
        </p>
      </section>

      {/* Filter Section */}
      <section className="bg-slate-50 py-16 sticky top-[80px] z-30 shadow-sm/50">
         <div className="container mx-auto px-4 overflow-x-auto">
            <div className="flex justify-center gap-4 min-w-max pb-4">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`
                    px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center
                    ${activeCategory === cat.value 
                      ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                  `}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
         </div>
      </section>

      {/* Grid Section */}
      <section className="bg-slate-50 pb-24 lg:pb-32 min-h-[600px]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-slate-200">
                   <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                   />
                   <div className="absolute top-4 left-4">
                     <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase text-slate-800 shadow-sm">
                       {project.categoryLabel}
                     </span>
                   </div>
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                    {project.title}
                  </h3>
                  <div className="flex items-center text-slate-500 mb-6">
                    <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-medium">{project.location}</span>
                  </div>

                  <button className="w-full py-3 px-4 rounded-lg border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all flex items-center justify-center group/btn">
                    Get This Look
                    <svg className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Footer CTA */}
      <section className="bg-slate-900 py-24 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            See something you like?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Bring your vision to life. Book an appointment today and let our team design the perfect fit for your home.
          </p>
          <Link 
            to="/contact" 
            className="inline-block bg-white text-slate-900 px-8 py-4 rounded-lg font-bold hover:bg-slate-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Book Appointment
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
