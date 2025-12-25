import { Bitcoin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedLogo } from '@/components/EnhancedLogo';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/" className="flex items-center space-x-2">
            <EnhancedLogo className="w-7 h-7 object-contain" />
            <span className="text-xl font-bold text-foreground flex items-center">
              Watt<Bitcoin className="inline w-5 h-5 -mx-0.5 text-watt-bitcoin" />yte
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> January 1, 2025 | <strong>Last Updated:</strong> December 25, 2024
          </p>

          <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-0">
              <strong>IMPORTANT:</strong> Please read these Terms of Service carefully before using any services provided by WattByte Infrastructure Company. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-muted/30 border border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mt-0 mb-4">Table of Contents</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-0">
              <li><a href="#acceptance" className="text-watt-trust hover:underline">Acceptance of Terms</a></li>
              <li><a href="#services" className="text-watt-trust hover:underline">Description of Services</a></li>
              <li><a href="#eligibility" className="text-watt-trust hover:underline">Eligibility Requirements</a></li>
              <li><a href="#accounts" className="text-watt-trust hover:underline">User Accounts & Registration</a></li>
              <li><a href="#acceptable-use" className="text-watt-trust hover:underline">Acceptable Use Policy</a></li>
              <li><a href="#marketplace" className="text-watt-trust hover:underline">GridBazaar Marketplace Terms</a></li>
              <li><a href="#investment" className="text-watt-trust hover:underline">Investment & Financial Disclaimers</a></li>
              <li><a href="#hosting" className="text-watt-trust hover:underline">Mining Hosting Services</a></li>
              <li><a href="#intellectual-property" className="text-watt-trust hover:underline">Intellectual Property Rights</a></li>
              <li><a href="#liability" className="text-watt-trust hover:underline">Limitation of Liability</a></li>
              <li><a href="#indemnification" className="text-watt-trust hover:underline">Indemnification</a></li>
              <li><a href="#disputes" className="text-watt-trust hover:underline">Dispute Resolution</a></li>
              <li><a href="#termination" className="text-watt-trust hover:underline">Termination</a></li>
              <li><a href="#modifications" className="text-watt-trust hover:underline">Modifications to Terms</a></li>
              <li><a href="#general" className="text-watt-trust hover:underline">General Provisions</a></li>
              <li><a href="#contact" className="text-watt-trust hover:underline">Contact Information</a></li>
            </ol>
          </div>

          {/* Section 1 */}
          <section id="acceptance" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">1. Acceptance of Terms</h2>
            <p className="text-foreground/80">
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and WattByte Infrastructure Company, a corporation incorporated under the laws of Alberta, Canada ("WattByte," "Company," "we," "us," or "our").
            </p>
            <p className="text-foreground/80">
              By accessing, browsing, or using our website located at wattbyte.com, our applications, platforms (including but not limited to VoltScout, GridBazaar, WattFund, and the WattByte Academy), or any services offered therein (collectively, the "Services"), you represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>You have the legal capacity and authority to enter into these Terms;</li>
              <li>You have read, understood, and agree to be bound by these Terms;</li>
              <li>You are not prohibited by any applicable law from entering into this agreement;</li>
              <li>You will comply with all applicable local, provincial, national, and international laws and regulations.</li>
            </ul>
            <p className="text-foreground/80">
              <strong>IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST IMMEDIATELY DISCONTINUE USE OF OUR SERVICES.</strong>
            </p>
          </section>

          {/* Section 2 */}
          <section id="services" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">2. Description of Services</h2>
            <p className="text-foreground/80">
              WattByte provides a comprehensive suite of services related to energy infrastructure, Bitcoin mining operations, and digital asset management:
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">2.1 VoltScout Platform</h3>
            <p className="text-foreground/80">
              VoltScout is our proprietary energy intelligence platform providing real-time market data, price predictions, analytics, and decision-support tools for energy market participants. The platform aggregates data from various sources including, but not limited to, the Alberta Electric System Operator (AESO) and other market operators.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.2 GridBazaar Marketplace</h3>
            <p className="text-foreground/80">
              GridBazaar is our online marketplace facilitating the buying, selling, and leasing of energy infrastructure assets, including power purchase agreements, substations, mining facilities, and related equipment. GridBazaar serves as an intermediary platform and does not take ownership of listed assets.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.3 WattFund</h3>
            <p className="text-foreground/80">
              WattFund provides information regarding investment opportunities in energy infrastructure projects. All investment-related content is provided for informational purposes only and does not constitute investment advice, a solicitation, or an offer to sell securities.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.4 Mining Hosting Services</h3>
            <p className="text-foreground/80">
              We offer hosting services for cryptocurrency mining equipment at our managed facilities, including power provisioning, cooling, maintenance, and security services.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.5 WattByte Academy</h3>
            <p className="text-foreground/80">
              Educational content and courses related to Bitcoin, cryptocurrency mining, energy markets, and data center operations.
            </p>
          </section>

          {/* Section 3 */}
          <section id="eligibility" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">3. Eligibility Requirements</h2>
            <p className="text-foreground/80">
              To use our Services, you must meet the following requirements:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Age:</strong> You must be at least eighteen (18) years of age, or the age of majority in your jurisdiction, whichever is greater;</li>
              <li><strong>Legal Capacity:</strong> You must have the full legal capacity to enter into binding contracts;</li>
              <li><strong>Jurisdiction:</strong> You must not be located in, or a citizen or resident of, any jurisdiction where the use of our Services would be prohibited by applicable law or regulation;</li>
              <li><strong>Sanctions:</strong> You must not be listed on any government sanctions list or be subject to economic sanctions or trade restrictions;</li>
              <li><strong>Corporate Authority:</strong> If you are using our Services on behalf of a corporation or other legal entity, you represent and warrant that you have the authority to bind such entity to these Terms.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="accounts" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">4. User Accounts & Registration</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">4.1 Account Creation</h3>
            <p className="text-foreground/80">
              Certain features of our Services require you to create an account. When creating an account, you agree to provide accurate, current, and complete information and to update such information to maintain its accuracy.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">4.2 Account Security</h3>
            <p className="text-foreground/80">
              You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">4.3 Account Verification</h3>
            <p className="text-foreground/80">
              We may require identity verification for certain Services, including but not limited to GridBazaar transactions exceeding specified thresholds, WattFund access, and hosting services. You agree to cooperate with our verification procedures and to provide requested documentation.
            </p>
          </section>

          {/* Section 5 */}
          <section id="acceptable-use" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">5. Acceptable Use Policy</h2>
            <p className="text-foreground/80">
              You agree not to use our Services to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Violate any applicable law, regulation, or third-party rights;</li>
              <li>Engage in fraud, money laundering, terrorist financing, or other financial crimes;</li>
              <li>Manipulate markets, engage in wash trading, or participate in price manipulation schemes;</li>
              <li>Upload or transmit malware, viruses, or other harmful code;</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts;</li>
              <li>Interfere with or disrupt the integrity or performance of our Services;</li>
              <li>Scrape, harvest, or collect data from our Services without express written permission;</li>
              <li>Create false or misleading listings on GridBazaar;</li>
              <li>Circumvent any access restrictions or security measures;</li>
              <li>Use our Services for any purpose that is competitive with our business without written consent;</li>
              <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with any person or entity.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="marketplace" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">6. GridBazaar Marketplace Terms</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">6.1 Role of Platform</h3>
            <p className="text-foreground/80">
              GridBazaar operates as an intermediary platform connecting buyers and sellers of energy infrastructure assets. We do not take ownership of, or title to, any assets listed on the platform. All transactions are conducted directly between buyers and sellers.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.2 Seller Obligations</h3>
            <p className="text-foreground/80">
              Sellers on GridBazaar represent and warrant that: (a) they have legal authority to sell or lease the listed assets; (b) all listing information is accurate and complete; (c) they will respond to inquiries in a timely manner; (d) they will honor accepted offers in good faith; and (e) they will comply with all applicable laws regarding the transfer of assets.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.3 Buyer Obligations</h3>
            <p className="text-foreground/80">
              Buyers on GridBazaar acknowledge that: (a) they are responsible for conducting their own due diligence; (b) WattByte does not guarantee the accuracy of any listing information; (c) they will complete transactions in good faith; and (d) they assume all risks associated with asset purchases.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.4 Fees and Commissions</h3>
            <p className="text-foreground/80">
              GridBazaar may charge fees or commissions for certain services, including listing fees, transaction fees, and premium placement fees. All applicable fees will be disclosed prior to any transaction.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.5 Disputes Between Users</h3>
            <p className="text-foreground/80">
              WattByte is not a party to transactions between users and shall not be liable for any disputes arising from such transactions. Users agree to resolve disputes directly with each other, though we may, at our sole discretion, provide mediation services.
            </p>
          </section>

          {/* Section 7 */}
          <section id="investment" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">7. Investment & Financial Disclaimers</h2>
            
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 my-6">
              <p className="text-foreground font-semibold mb-2">IMPORTANT INVESTMENT WARNINGS</p>
              <p className="text-foreground/80 text-sm mb-0">
                The following disclaimers are critical to your understanding of the risks associated with our Services.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.1 No Investment Advice</h3>
            <p className="text-foreground/80">
              Nothing contained in our Services constitutes investment advice, financial advice, trading advice, or any other form of advice. You should not treat any content on our platform as a recommendation to make any investment decision.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.2 Cryptocurrency Risks</h3>
            <p className="text-foreground/80">
              Cryptocurrency, including Bitcoin, is a highly volatile and speculative asset class. The value of cryptocurrency can decrease significantly, including to zero. Past performance is not indicative of future results. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Cryptocurrency markets are unregulated in many jurisdictions;</li>
              <li>Mining difficulty and network hashrate fluctuations affect profitability;</li>
              <li>Regulatory changes may adversely impact cryptocurrency values;</li>
              <li>Technical vulnerabilities may result in loss of assets;</li>
              <li>You may lose your entire investment.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.3 Energy Market Risks</h3>
            <p className="text-foreground/80">
              Energy markets are subject to significant volatility due to weather, demand fluctuations, regulatory changes, and other factors. Our predictions and analytics are based on historical data and models that may not accurately predict future market conditions.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.4 WattFund Disclosure</h3>
            <p className="text-foreground/80">
              WattFund materials are provided for informational purposes only and do not constitute an offer to sell or a solicitation of an offer to buy any securities. Any investment in funds or projects described through WattFund requires execution of separate subscription documents and is subject to eligibility requirements.
            </p>
          </section>

          {/* Section 8 */}
          <section id="hosting" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">8. Mining Hosting Services</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">8.1 Service Level</h3>
            <p className="text-foreground/80">
              Hosting services are provided subject to a separate Hosting Agreement that governs uptime guarantees, maintenance windows, and service credits. In the event of conflict between these Terms and a Hosting Agreement, the Hosting Agreement shall prevail with respect to hosting services.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">8.2 Equipment Requirements</h3>
            <p className="text-foreground/80">
              All mining equipment must meet our technical specifications and safety requirements. We reserve the right to refuse equipment that does not meet our standards or poses safety risks.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">8.3 Power Costs</h3>
            <p className="text-foreground/80">
              Power costs are billed based on metered usage at rates specified in your Hosting Agreement. Rates may be subject to change with notice as provided in your agreement.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">8.4 Equipment Liability</h3>
            <p className="text-foreground/80">
              While we maintain security and environmental controls at our facilities, we are not liable for damage to equipment beyond our direct control, including damage from force majeure events, power surges, or manufacturer defects.
            </p>
          </section>

          {/* Section 9 */}
          <section id="intellectual-property" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">9. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">9.1 Our Intellectual Property</h3>
            <p className="text-foreground/80">
              All content, features, and functionality of our Services, including but not limited to text, graphics, logos, icons, images, audio clips, video clips, data compilations, software, and the compilation thereof, are the exclusive property of WattByte or our licensors and are protected by Canadian and international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">9.2 Trademarks</h3>
            <p className="text-foreground/80">
              WattByte, VoltScout, GridBazaar, WattFund, and associated logos are trademarks of WattByte Infrastructure Company. You may not use our trademarks without our prior written consent.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">9.3 User Content</h3>
            <p className="text-foreground/80">
              By submitting content to our Services, you grant WattByte a non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to use, reproduce, modify, distribute, and display such content in connection with operating and promoting our Services.
            </p>
          </section>

          {/* Section 10 */}
          <section id="liability" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">10. Limitation of Liability</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">10.1 Disclaimer of Warranties</h3>
            <p className="text-foreground/80">
              OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">10.2 Limitation of Damages</h3>
            <p className="text-foreground/80">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WATTBYTE, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OR INABILITY TO USE OUR SERVICES.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">10.3 Cap on Liability</h3>
            <p className="text-foreground/80">
              OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR YOUR USE OF OUR SERVICES SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNTS YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM; OR (B) ONE HUNDRED CANADIAN DOLLARS (CAD $100.00).
            </p>
          </section>

          {/* Section 11 */}
          <section id="indemnification" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">11. Indemnification</h2>
            <p className="text-foreground/80">
              You agree to indemnify, defend, and hold harmless WattByte and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including attorney's fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Your use of and access to our Services;</li>
              <li>Your violation of these Terms;</li>
              <li>Your violation of any third-party rights, including intellectual property rights;</li>
              <li>Your violation of any applicable law or regulation;</li>
              <li>Any content you submit to our Services;</li>
              <li>Any transaction you conduct through GridBazaar.</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section id="disputes" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">12. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">12.1 Governing Law</h3>
            <p className="text-foreground/80">
              These Terms shall be governed by and construed in accordance with the laws of the Province of Alberta and the federal laws of Canada applicable therein, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">12.2 Arbitration Agreement</h3>
            <p className="text-foreground/80">
              Any dispute, controversy, or claim arising out of or relating to these Terms or the breach, termination, or invalidity thereof shall be settled by arbitration administered by the ADR Institute of Canada in accordance with its Arbitration Rules. The place of arbitration shall be Calgary, Alberta. The language of arbitration shall be English.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">12.3 Class Action Waiver</h3>
            <p className="text-foreground/80">
              YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">12.4 Exceptions</h3>
            <p className="text-foreground/80">
              Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property rights.
            </p>
          </section>

          {/* Section 13 */}
          <section id="termination" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">13. Termination</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">13.1 Termination by You</h3>
            <p className="text-foreground/80">
              You may terminate your account at any time by contacting us at legal@wattbyte.com or through your account settings.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">13.2 Termination by Us</h3>
            <p className="text-foreground/80">
              We reserve the right to suspend or terminate your access to our Services at any time, with or without cause, with or without notice, effective immediately. Grounds for termination include, but are not limited to, breach of these Terms, suspected fraudulent activity, or as required by law.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">13.3 Effect of Termination</h3>
            <p className="text-foreground/80">
              Upon termination, your right to use our Services will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          {/* Section 14 */}
          <section id="modifications" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">14. Modifications to Terms</h2>
            <p className="text-foreground/80">
              We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or by posting a notice on our website at least thirty (30) days before the changes take effect. Your continued use of our Services after the effective date of the revised Terms constitutes your acceptance of the changes.
            </p>
          </section>

          {/* Section 15 */}
          <section id="general" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">15. General Provisions</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">15.1 Entire Agreement</h3>
            <p className="text-foreground/80">
              These Terms, together with our Privacy Policy and any other agreements expressly incorporated by reference, constitute the entire agreement between you and WattByte concerning our Services.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">15.2 Severability</h3>
            <p className="text-foreground/80">
              If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">15.3 Waiver</h3>
            <p className="text-foreground/80">
              Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">15.4 Assignment</h3>
            <p className="text-foreground/80">
              You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">15.5 Force Majeure</h3>
            <p className="text-foreground/80">
              WattByte shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
            </p>
          </section>

          {/* Section 16 */}
          <section id="contact" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">16. Contact Information</h2>
            <p className="text-foreground/80">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-6 mt-4">
              <p className="text-foreground font-semibold mb-2">WattByte Infrastructure Company</p>
              <p className="text-foreground/80 mb-1">Legal Department</p>
              <p className="text-foreground/80 mb-1">Email: legal@wattbyte.com</p>
              <p className="text-foreground/80 mb-1">General Inquiries: contact@wattbyte.com</p>
              <p className="text-foreground/80 mb-0">Website: www.wattbyte.com</p>
            </div>
          </section>

          <div className="border-t border-border pt-8 mt-12">
            <p className="text-sm text-muted-foreground">
              By using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              © 2025 WattByte Infrastructure Company. All rights reserved.
            </p>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
