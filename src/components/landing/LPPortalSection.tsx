
import { Lock } from 'lucide-react';

export const LPPortalSection = () => {
  return (
    <section className="relative z-10 py-8 sm:py-10 md:py-12 px-4 sm:px-6 bg-watt-light">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <Lock className="w-5 sm:w-6 h-5 sm:h-6 text-watt-trust" />
          <h2 className="text-2xl sm:text-3xl font-bold text-watt-navy">Secure LP Portal</h2>
        </div>
        
        <p className="text-base sm:text-lg text-watt-navy/70 mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
          Exclusive access to VoltScout's internal reports, site leads, and fund investment dashboards
        </p>
        
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 max-w-2xl mx-auto shadow-institutional">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-watt-navy">Portal Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-left">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-watt-trust rounded-full flex-shrink-0"></div>
                <span className="text-watt-navy/80 text-xs sm:text-sm">Real-time fund performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-watt-bitcoin rounded-full flex-shrink-0"></div>
                <span className="text-watt-navy/80 text-xs sm:text-sm">Property acquisition reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-watt-success rounded-full flex-shrink-0"></div>
                <span className="text-watt-navy/80 text-xs sm:text-sm">VoltScout analytics dashboard</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-watt-warning rounded-full flex-shrink-0"></div>
                <span className="text-watt-navy/80 text-xs sm:text-sm">Monthly investor updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-watt-trust rounded-full flex-shrink-0"></div>
                <span className="text-watt-navy/80 text-xs sm:text-sm">Exit opportunity pipeline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-watt-trust rounded-full flex-shrink-0"></div>
                <span className="text-watt-navy/80 text-xs sm:text-sm">Direct team communication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
