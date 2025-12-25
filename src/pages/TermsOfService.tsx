import { LegalPageHeader } from '@/components/legal/LegalPageHeader';
import { LegalPageFooter } from '@/components/legal/LegalPageFooter';
import { LazyLegalSection } from '@/components/legal/LazyLegalSection';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <LegalPageHeader />

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

          {/* Section 1 - Render immediately (above fold) */}
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

          {/* Section 2 - Lazy loaded */}
          <LazyLegalSection id="services">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">2. Description of Services</h2>
            <p className="text-foreground/80">
              WattByte provides a comprehensive suite of services related to energy infrastructure, Bitcoin mining operations, and digital asset management:
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">2.1 VoltScout Platform</h3>
            <p className="text-foreground/80">
              VoltScout is our proprietary energy intelligence platform providing real-time market data, price predictions, analytics, and decision-support tools for energy market participants.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.2 GridBazaar Marketplace</h3>
            <p className="text-foreground/80">
              GridBazaar is our online marketplace facilitating the buying, selling, and leasing of energy infrastructure assets, including power purchase agreements, substations, mining facilities, and related equipment.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.3 WattFund</h3>
            <p className="text-foreground/80">
              WattFund provides information regarding investment opportunities in energy infrastructure projects. All investment-related content is for informational purposes only.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.4 Mining Hosting Services</h3>
            <p className="text-foreground/80">
              We offer hosting services for cryptocurrency mining equipment at our managed facilities.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.5 WattByte Academy</h3>
            <p className="text-foreground/80">
              Educational content and courses related to Bitcoin, cryptocurrency mining, energy markets, and data center operations.
            </p>
          </LazyLegalSection>

          {/* Section 3 */}
          <LazyLegalSection id="eligibility">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">3. Eligibility Requirements</h2>
            <p className="text-foreground/80">
              To use our Services, you must meet the following requirements:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Age:</strong> You must be at least eighteen (18) years of age;</li>
              <li><strong>Legal Capacity:</strong> You must have the full legal capacity to enter into binding contracts;</li>
              <li><strong>Jurisdiction:</strong> You must not be located in any jurisdiction where the use of our Services would be prohibited;</li>
              <li><strong>Sanctions:</strong> You must not be listed on any government sanctions list;</li>
              <li><strong>Corporate Authority:</strong> If using on behalf of an entity, you must have authority to bind that entity.</li>
            </ul>
          </LazyLegalSection>

          {/* Section 4 */}
          <LazyLegalSection id="accounts">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">4. User Accounts & Registration</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">4.1 Account Creation</h3>
            <p className="text-foreground/80">
              Certain features require you to create an account. You agree to provide accurate, current, and complete information.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">4.2 Account Security</h3>
            <p className="text-foreground/80">
              You are solely responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">4.3 Account Verification</h3>
            <p className="text-foreground/80">
              We may require identity verification for certain Services. You agree to cooperate with our verification procedures.
            </p>
          </LazyLegalSection>

          {/* Section 5 */}
          <LazyLegalSection id="acceptable-use">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">5. Acceptable Use Policy</h2>
            <p className="text-foreground/80">
              You agree not to use our Services to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Violate any applicable law, regulation, or third-party rights;</li>
              <li>Engage in fraud, money laundering, or other financial crimes;</li>
              <li>Manipulate markets or engage in price manipulation schemes;</li>
              <li>Upload or transmit malware, viruses, or harmful code;</li>
              <li>Attempt to gain unauthorized access to our systems;</li>
              <li>Interfere with or disrupt the integrity of our Services;</li>
              <li>Scrape or collect data without express written permission;</li>
              <li>Create false or misleading listings on GridBazaar;</li>
              <li>Impersonate any person or entity.</li>
            </ul>
          </LazyLegalSection>

          {/* Section 6 */}
          <LazyLegalSection id="marketplace">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">6. GridBazaar Marketplace Terms</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">6.1 Role of Platform</h3>
            <p className="text-foreground/80">
              GridBazaar operates as an intermediary platform. We do not take ownership of listed assets.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.2 Seller Obligations</h3>
            <p className="text-foreground/80">
              Sellers represent and warrant that they have legal authority to sell or lease listed assets and that all listing information is accurate.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.3 Buyer Obligations</h3>
            <p className="text-foreground/80">
              Buyers are responsible for conducting their own due diligence. WattByte does not guarantee listing accuracy.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.4 Fees and Commissions</h3>
            <p className="text-foreground/80">
              GridBazaar may charge fees for certain services. All applicable fees will be disclosed prior to transactions.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.5 Disputes Between Users</h3>
            <p className="text-foreground/80">
              WattByte is not a party to transactions between users and shall not be liable for disputes arising from such transactions.
            </p>
          </LazyLegalSection>

          {/* Section 7 */}
          <LazyLegalSection id="investment">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">7. Investment & Financial Disclaimers</h2>
            
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 my-6">
              <p className="text-foreground font-semibold mb-2">IMPORTANT INVESTMENT WARNINGS</p>
              <p className="text-foreground/80 text-sm mb-0">
                The following disclaimers are critical to your understanding of the risks associated with our Services.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.1 No Investment Advice</h3>
            <p className="text-foreground/80">
              Nothing contained in our Services constitutes investment advice, financial advice, or trading advice.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.2 Cryptocurrency Risks</h3>
            <p className="text-foreground/80">
              Cryptocurrency is highly volatile and speculative. You may lose your entire investment.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.3 Energy Market Risks</h3>
            <p className="text-foreground/80">
              Energy markets are subject to significant volatility. Our predictions may not accurately predict future conditions.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.4 WattFund Disclosure</h3>
            <p className="text-foreground/80">
              WattFund materials are for informational purposes only and do not constitute an offer to sell securities.
            </p>
          </LazyLegalSection>

          {/* Section 8 */}
          <LazyLegalSection id="hosting">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">8. Mining Hosting Services</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">8.1 Service Level</h3>
            <p className="text-foreground/80">
              Hosting services are provided subject to a separate Hosting Agreement that governs uptime guarantees and service credits.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">8.2 Equipment Requirements</h3>
            <p className="text-foreground/80">
              Equipment must meet our specifications. We reserve the right to refuse equipment that does not meet our requirements.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">8.3 Power and Connectivity</h3>
            <p className="text-foreground/80">
              We provide power and network connectivity as specified in the Hosting Agreement.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">8.4 Maintenance and Access</h3>
            <p className="text-foreground/80">
              We may perform scheduled and emergency maintenance. Physical access to facilities is subject to security protocols.
            </p>
          </LazyLegalSection>

          {/* Section 9 */}
          <LazyLegalSection id="intellectual-property">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">9. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">9.1 Our Intellectual Property</h3>
            <p className="text-foreground/80">
              All content, software, algorithms, trademarks, and other intellectual property are owned by WattByte.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">9.2 License Grant</h3>
            <p className="text-foreground/80">
              We grant you a limited, non-exclusive, non-transferable license to access and use our Services.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">9.3 Restrictions</h3>
            <p className="text-foreground/80">
              You may not copy, modify, reverse engineer, or create derivative works based on our intellectual property.
            </p>
          </LazyLegalSection>

          {/* Section 10 */}
          <LazyLegalSection id="liability">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">10. Limitation of Liability</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">10.1 Disclaimer of Warranties</h3>
            <p className="text-foreground/80">
              OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">10.2 Limitation of Damages</h3>
            <p className="text-foreground/80">
              IN NO EVENT SHALL WATTBYTE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">10.3 Maximum Liability</h3>
            <p className="text-foreground/80">
              Our total liability shall not exceed the greater of CAD $1,000 or the fees paid by you in the twelve months preceding the claim.
            </p>
          </LazyLegalSection>

          {/* Section 11 */}
          <LazyLegalSection id="indemnification">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">11. Indemnification</h2>
            <p className="text-foreground/80">
              You agree to indemnify, defend, and hold harmless WattByte and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Services or violation of these Terms.
            </p>
          </LazyLegalSection>

          {/* Section 12 */}
          <LazyLegalSection id="disputes">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">12. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">12.1 Governing Law</h3>
            <p className="text-foreground/80">
              These Terms shall be governed by and construed in accordance with the laws of the Province of Alberta, Canada.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">12.2 Arbitration</h3>
            <p className="text-foreground/80">
              Any disputes shall be resolved through binding arbitration in Calgary, Alberta.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">12.3 Class Action Waiver</h3>
            <p className="text-foreground/80">
              You agree to resolve disputes on an individual basis and waive any right to participate in class actions.
            </p>
          </LazyLegalSection>

          {/* Section 13 */}
          <LazyLegalSection id="termination">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">13. Termination</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">13.1 Termination by You</h3>
            <p className="text-foreground/80">
              You may terminate your account at any time by contacting us or using account settings.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">13.2 Termination by Us</h3>
            <p className="text-foreground/80">
              We may suspend or terminate your access at any time for violation of these Terms or for any other reason.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">13.3 Effect of Termination</h3>
            <p className="text-foreground/80">
              Upon termination, your right to access the Services ceases immediately. Certain provisions survive termination.
            </p>
          </LazyLegalSection>

          {/* Section 14 */}
          <LazyLegalSection id="modifications">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">14. Modifications to Terms</h2>
            <p className="text-foreground/80">
              We may modify these Terms at any time by posting the revised Terms on our website. Your continued use of the Services after such modifications constitutes acceptance of the updated Terms.
            </p>
          </LazyLegalSection>

          {/* Section 15 */}
          <LazyLegalSection id="general">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">15. General Provisions</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">15.1 Entire Agreement</h3>
            <p className="text-foreground/80">
              These Terms constitute the entire agreement between you and WattByte regarding the Services.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">15.2 Severability</h3>
            <p className="text-foreground/80">
              If any provision is found to be unenforceable, the remaining provisions shall continue in effect.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">15.3 Waiver</h3>
            <p className="text-foreground/80">
              Our failure to enforce any provision shall not constitute a waiver of that provision.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">15.4 Assignment</h3>
            <p className="text-foreground/80">
              You may not assign your rights under these Terms without our written consent.
            </p>
          </LazyLegalSection>

          {/* Section 16 */}
          <LazyLegalSection id="contact">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">16. Contact Information</h2>
            <p className="text-foreground/80">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-6 mt-4">
              <p className="text-foreground/80 mb-2"><strong>WattByte Infrastructure Company</strong></p>
              <p className="text-foreground/80 mb-2">Legal Department</p>
              <p className="text-foreground/80 mb-2">Calgary, Alberta, Canada</p>
              <p className="text-foreground/80 mb-2">Email: legal@wattbyte.com</p>
              <p className="text-foreground/80 mb-0">Website: wattbyte.com</p>
            </div>
          </LazyLegalSection>
        </div>
      </main>

      <LegalPageFooter />
    </div>
  );
}
