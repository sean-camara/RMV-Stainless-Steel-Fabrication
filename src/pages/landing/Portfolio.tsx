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
    { value: 'all', label: 'All Samples' },
    { value: 'gates', label: 'Gates' },
    { value: 'railings', label: 'Railings' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'stairs', label: 'Stairs' },
    { value: 'grills', label: 'Grills' },
    { value: 'commercial', label: 'Commercial' },
  ];

  const projects: Project[] = [
    {
      id: 1,
      title: 'Sample Gate Fabrication',
      location: 'Valenzuela City',
      category: 'gates',
      categoryLabel: 'GATES',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      title: 'Sample Kitchen Counter',
      location: 'Valenzuela City',
      category: 'kitchen',
      categoryLabel: 'KITCHEN',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      title: 'Sample Railing Design',
      location: 'Valenzuela City',
      category: 'stairs',
      categoryLabel: 'STAIRS',
      image: 'https://images.unsplash.com/photo-1522050212171-61b01dd24579?auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      title: 'Sample Balcony Railing',
      location: 'Valenzuela City',
      category: 'railings',
      categoryLabel: 'RAILINGS',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80',
    },
    {
      id: 5,
      title: 'Small Commercial Counter',
      location: 'Valenzuela City',
      category: 'commercial',
      categoryLabel: 'COMMERCIAL',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
    },
    {
      id: 6,
      title: 'Sample Window Grill',
      location: 'Valenzuela City',
      category: 'grills',
      categoryLabel: 'GRILLS',
      image: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&q=80',
    },
    {
      id: 7,
      title: 'Sample Swing Gate',
      location: 'Valenzuela City',
      category: 'gates',
      categoryLabel: 'GATES',
      image: 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&q=80',
    },
    {
      id: 8,
      title: 'Sample Kitchen Table',
      location: 'Valenzuela City',
      category: 'kitchen',
      categoryLabel: 'KITCHEN',
      image: 'https://images.unsplash.com/photo-1590791182857-9cf6a27778b4?auto=format&fit=crop&q=80',
    },
    {
      id: 9,
      title: 'Sample Guard Rail',
      location: 'Valenzuela City',
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
      <section className="relative px-4 overflow-hidden bg-white" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
        
        <div className="container mx-auto text-center relative z-10">
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-[1.1] tracking-tighter hero-fade-up hero-delay-1">
            Project Gallery
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-light hero-fade-up hero-delay-2">
            This gallery demonstrates the system's capability to categorize and display project types. 
            The cases below serve as technical samples for this thesis prototype.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white border-y border-slate-100 py-8 sticky top-[80px] z-30 backdrop-blur-md bg-white/80">
         <div className="container mx-auto px-4 overflow-x-auto">
            <div className="flex justify-center gap-3 min-w-max hero-fade-up">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`
                    px-4 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-300
                    ${activeCategory === cat.value 
                      ? 'bg-slate-950 text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] scale-105' 
                      : 'bg-transparent text-slate-400 hover:text-slate-950'}
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>
         </div>
      </section>

      {/* Grid Section */}
      <section className="bg-slate-50 py-24 lg:py-32 min-h-[600px] relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {filteredProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="group bg-white rounded-3xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 hero-fade-up"
                style={{ animationDelay: `${0.1 + index * 0.07}s` }}
              >
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden bg-slate-200">
                   <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                   />
                   <div className="absolute top-6 left-6">
                     <span className="bg-slate-950/90 backdrop-blur-md px-4 py-1.5 rounded-lg text-[9px] font-bold tracking-[0.2em] uppercase text-white shadow-xl">
                       {project.categoryLabel}
                     </span>
                   </div>
                   <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-colors duration-500"></div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-center text-slate-400 mb-4">
                    <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] font-bold tracking-widest uppercase">{project.location}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
                    {project.title}
                  </h3>

                  <button className="w-full py-4 px-6 rounded-2xl border border-slate-100 bg-slate-50 text-slate-900 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all duration-300 group/btn shadow-sm">
                    View Case Sample
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Footer CTA */}
      <section className="bg-slate-950 py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />
             
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8 tracking-tighter hero-fade-up">
            Project Inquiries
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-light hero-fade-up hero-delay-1">
            Book an appointment for a formal project consultation and system-driven cost estimation.
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-white text-slate-950 px-12 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1 hero-fade-up hero-delay-2"
          >
            Book Appointment
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
