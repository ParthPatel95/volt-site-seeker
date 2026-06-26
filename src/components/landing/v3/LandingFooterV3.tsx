import { Bitcoin, Mail, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedLogo } from '../../EnhancedLogo';

const COLS = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'WattFund', to: '/wattfund' },
      { label: 'Mining Hosting', to: '/hosting' },
      { label: 'Advisory', to: '/advisory' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Bitcoin 101', to: '/academy/auth' },
      { label: 'Datacenters 101', to: '/academy/auth' },
      { label: 'Mining Economics 101', to: '/academy/auth' },
      { label: 'All Courses →', to: '/academy', accent: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'VoltScout Platform', to: '/app' },
      { label: 'GridBazaar', href: 'https://www.gridbazaar.com' },
    ],
  },
] as const;

export function LandingFooterV3() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#04070f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <EnhancedLogo className="h-7 w-7 object-contain" />
              <span className="flex items-center text-xl font-bold">
                Watt<Bitcoin className="-mx-0.5 h-5 w-5 text-watt-bitcoin" />yte
              </span>
            </div>
            <p className="mb-5 max-w-sm text-sm leading-relaxed text-white/55">
              We turn stranded power into the compute behind modern AI — sourcing, developing
              and operating energy-first datacenter infrastructure worldwide.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/wattbyte/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/55 transition-colors hover:text-watt-bitcoin"><Instagram className="h-5 w-5" /></a>
              <a href="https://www.linkedin.com/company/wattbyte" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white/55 transition-colors hover:text-watt-bitcoin"><Linkedin className="h-5 w-5" /></a>
              <a href="mailto:contact@wattbyte.com" aria-label="Email" className="text-white/55 transition-colors hover:text-watt-bitcoin"><Mail className="h-5 w-5" /></a>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold text-white">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {'href' in l && l.href ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/55 transition-colors hover:text-white">{l.label}</a>
                    ) : (
                      <Link to={(l as { to: string }).to} className={`text-sm transition-colors hover:text-white ${'accent' in l && l.accent ? 'font-medium text-watt-bitcoin' : 'text-white/55'}`}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} WattByte Infrastructure Company. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-white/40 transition-colors hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-white/40 transition-colors hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
