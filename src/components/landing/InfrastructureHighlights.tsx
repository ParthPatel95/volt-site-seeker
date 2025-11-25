import React from 'react';
import jinjaImage from '@/assets/pipeline/jinja-uganda-hydro.jpg';
import texasImage from '@/assets/pipeline/texas-natgas.jpg';
import nepalImage from '@/assets/pipeline/nepal-mix.jpg';
import bhutanImage from '@/assets/pipeline/bhutan-hydro.jpg';
import indiaImage from '@/assets/pipeline/india-solar-hydro.jpg';
import newfoundlandImage from '@/assets/pipeline/newfoundland-canada-hybrid.jpg';
import ugandaFlag from '@/assets/pipeline/flags/uganda-ug.svg';
import unitedStatesFlag from '@/assets/pipeline/flags/united-states-us.svg';
import nepalFlag from '@/assets/pipeline/flags/nepal-np.svg';
import bhutanFlag from '@/assets/pipeline/flags/bhutan-bt.svg';
import indiaFlag from '@/assets/pipeline/flags/india-in.svg';
import canadaFlag from '@/assets/pipeline/flags/canada-ca.svg';
const pipeline = [
  {
    location: 'Jinja, Uganda',
    capacity: '400MW',
    type: 'On-Grid Hydro',
    description: 'Hydroelectric power facility leveraging the Nile River with direct grid connection',
    image: jinjaImage,
    flag: ugandaFlag
  },
  {
    location: 'Texas, USA',
    capacity: '536MW',
    type: 'On-Grid Mix + Self-Gen Natgas',
    description: 'Mixed generation facility with natural gas backup and grid interconnection',
    image: texasImage,
    flag: unitedStatesFlag
  },
  {
    location: 'Nepal',
    capacity: '75MW',
    type: 'On-Grid Mix',
    description: 'Himalayan renewable energy infrastructure with grid-connected mixed generation',
    image: nepalImage,
    flag: nepalFlag
  },
  {
    location: 'Bhutan',
    capacity: '175MW',
    type: 'On-Grid Hydro',
    description: 'Large-scale hydroelectric facility utilizing pristine mountain water resources',
    image: bhutanImage,
    flag: bhutanFlag
  },
  {
    location: 'India',
    capacity: '45MW',
    type: 'Solar+Hydro BTM',
    description: 'Behind-the-meter hybrid solar and hydroelectric renewable energy system',
    image: indiaImage,
    flag: indiaFlag
  },
  {
    location: 'Newfoundland, Canada',
    capacity: '198MW',
    type: 'On-Grid Hybrid',
    description: 'Advanced hybrid renewable energy facility combining coastal wind and hydroelectric power',
    image: newfoundlandImage,
    flag: canadaFlag
  }
];

export const InfrastructureHighlights = () => {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Development <span className="text-electric-blue">Pipeline</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Strategic power infrastructure investments across <span className="text-neon-green font-semibold">global markets</span> totaling <span className="text-electric-yellow font-semibold">1,429 MW</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pipeline.map((project, index) => (
            <div 
              key={index}
              className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50"
            >
              
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={`${project.location} power facility`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
              </div>
              
              <div className="relative p-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                  <span className="inline-flex items-center justify-center w-7 h-5 mr-2 rounded-sm overflow-hidden ring-1 ring-slate-600/60 bg-slate-900/80">
                    <img
                      src={project.flag}
                      alt={`${project.location} flag`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </span>
                  {project.location}
                </h3>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl font-bold text-neon-green">
                    {project.capacity}
                  </div>
                  <div className="text-sm text-electric-blue font-semibold">
                    {project.type}
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};