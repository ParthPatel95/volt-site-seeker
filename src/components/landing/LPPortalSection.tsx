
import { Lock } from 'lucide-react';

export const LPPortalSection = () => {
  return (
    <section className="relative z-10 py-12 px-6 bg-slate-900/50">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Lock className="w-6 h-6 text-electric-blue" />
          <h2 className="text-3xl font-bold text-white">Secure LP Portal</h2>
        </div>
        
        <p className="text-lg text-slate-200 mb-6 max-w-2xl mx-auto">
          Exclusive access to VoltScout's internal reports, site leads, and fund investment dashboards
        </p>
        
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-white">Portal Features</h3>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
                <span className="text-slate-200 text-sm">Real-time fund performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-electric-yellow rounded-full"></div>
                <span className="text-slate-200 text-sm">Property acquisition reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                <span className="text-slate-200 text-sm">VoltScout analytics dashboard</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warm-orange rounded-full"></div>
                <span className="text-slate-200 text-sm">Monthly investor updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-bright-cyan rounded-full"></div>
                <span className="text-slate-200 text-sm">Exit opportunity pipeline</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
                <span className="text-slate-200 text-sm">Direct team communication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
