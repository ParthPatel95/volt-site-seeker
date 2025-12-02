import { Bitcoin, Mail, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedLogo } from '../EnhancedLogo';

export const LandingFooter = () => {
  return (
    <footer className="relative z-10 bg-white border-t border-watt-navy/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <EnhancedLogo className="w-7 h-7 object-contain" />
              <span className="text-xl font-bold text-watt-navy flex items-center">
                Watt<Bitcoin className="inline w-5 h-5 -mx-0.5 text-watt-bitcoin" />yte
              </span>
            </div>
            <p className="text-watt-navy/70 text-sm mb-4 max-w-md">
              Turning power into profit through intelligent infrastructure investment
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://www.instagram.com/wattbyte/" target="_blank" rel="noopener noreferrer" className="text-watt-navy/60 hover:text-watt-trust transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/wattbyte" target="_blank" rel="noopener noreferrer" className="text-watt-navy/60 hover:text-watt-trust transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:contact@wattbyte.com" className="text-watt-navy/60 hover:text-watt-trust transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-watt-navy mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-watt-navy/70 hover:text-watt-trust transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/wattfund" className="text-sm text-watt-navy/70 hover:text-watt-trust transition-colors">
                  WattFund
                </Link>
              </li>
              <li>
                <Link to="/hosting" className="text-sm text-watt-navy/70 hover:text-watt-trust transition-colors">
                  Mining Hosting
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-watt-navy mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/app" className="text-sm text-watt-navy/70 hover:text-watt-trust transition-colors">
                  VoltScout Platform
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-watt-navy/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-watt-navy/50">
            © 2025 WattByte Infrastructure Company. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <a href="#privacy" className="text-xs text-watt-navy/50 hover:text-watt-trust transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-xs text-watt-navy/50 hover:text-watt-trust transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
