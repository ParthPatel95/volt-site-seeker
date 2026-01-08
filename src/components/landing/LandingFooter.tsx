import { Bitcoin, Mail, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedLogo } from '../EnhancedLogo';

export const LandingFooter = () => {
  return (
    <footer className="relative z-10 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <EnhancedLogo className="w-7 h-7 object-contain" />
              <span className="text-xl font-bold text-foreground flex items-center">
                Watt<Bitcoin className="inline w-5 h-5 -mx-0.5 text-watt-bitcoin" />yte
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Turning power into profit through intelligent infrastructure investment
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://www.instagram.com/wattbyte/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/wattbyte" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:contact@wattbyte.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/wattfund" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  WattFund
                </Link>
              </li>
              <li>
                <Link to="/hosting" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mining Hosting
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn - All courses require login */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Learn</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/academy/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Bitcoin 101
                </Link>
              </li>
              <li>
                <Link to="/academy/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Datacenters 101
                </Link>
              </li>
              <li>
                <Link to="/academy/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mining Economics 101
                </Link>
              </li>
              <li>
                <Link to="/academy" className="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
                  View All Courses →
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/app" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  VoltScout Platform
                </Link>
              </li>
              <li>
                <a href="https://www.gridbazaar.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  GridBazaar
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-muted-foreground">
            © 2025 WattByte Infrastructure Company. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
