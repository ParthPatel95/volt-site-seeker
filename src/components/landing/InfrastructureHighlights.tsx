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
    <section className="relative py-16 sm:py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            <span className="text-watt-navy">Development </span>
            <span className="text-watt-trust">Pipeline</span>
          </h2>
          <p className="text-base md:text-lg text-watt-navy/70 max-w-3xl mx-auto leading-relaxed">
            Strategic power infrastructure investments across global markets totaling <span className="text-watt-bitcoin font-bold">1,429 MW</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pipeline.map((project, index) => (
            <div 
              key={index}
              className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-institutional hover:shadow-lg transition-all duration-300"
            >
              
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={`${project.location} power facility`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="relative p-6">
                <h3 className="text-xl font-bold text-watt-navy mb-2 flex items-center">
                  <span className="inline-flex items-center justify-center w-7 h-5 mr-2 rounded-sm overflow-hidden ring-1 ring-gray-300 bg-white">
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
                  <div className="text-2xl font-bold text-watt-success">
                    {project.capacity}
                  </div>
                  <div className="text-sm text-watt-trust font-semibold">
                    {project.type}
                  </div>
                </div>
                
                <p className="text-watt-navy/70 text-sm leading-relaxed">
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