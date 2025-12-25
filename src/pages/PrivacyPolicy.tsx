import { LegalPageHeader } from '@/components/legal/LegalPageHeader';
import { LegalPageFooter } from '@/components/legal/LegalPageFooter';
import { LazyLegalSection } from '@/components/legal/LazyLegalSection';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <LegalPageHeader />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> January 1, 2025 | <strong>Last Updated:</strong> December 25, 2024
          </p>

          <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-0">
              WattByte Infrastructure Company ("WattByte," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and services (collectively, the "Services").
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-muted/30 border border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mt-0 mb-4">Table of Contents</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-0">
              <li><a href="#information-collected" className="text-watt-trust hover:underline">Information We Collect</a></li>
              <li><a href="#how-we-use" className="text-watt-trust hover:underline">How We Use Your Information</a></li>
              <li><a href="#information-sharing" className="text-watt-trust hover:underline">Information Sharing & Disclosure</a></li>
              <li><a href="#data-security" className="text-watt-trust hover:underline">Data Security</a></li>
              <li><a href="#data-retention" className="text-watt-trust hover:underline">Data Retention</a></li>
              <li><a href="#your-rights" className="text-watt-trust hover:underline">Your Rights & Choices</a></li>
              <li><a href="#cookies" className="text-watt-trust hover:underline">Cookies & Tracking Technologies</a></li>
              <li><a href="#international" className="text-watt-trust hover:underline">International Data Transfers</a></li>
              <li><a href="#children" className="text-watt-trust hover:underline">Children's Privacy</a></li>
              <li><a href="#third-party" className="text-watt-trust hover:underline">Third-Party Links & Services</a></li>
              <li><a href="#canadian-law" className="text-watt-trust hover:underline">Canadian Privacy Law Compliance</a></li>
              <li><a href="#changes" className="text-watt-trust hover:underline">Changes to This Policy</a></li>
              <li><a href="#contact" className="text-watt-trust hover:underline">Contact Information</a></li>
            </ol>
          </div>

          {/* Section 1 - Render immediately (above fold) */}
          <section id="information-collected" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">1. Information We Collect</h2>
            <p className="text-foreground/80">
              We collect information in several ways depending on how you interact with our Services:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">1.1 Information You Provide Directly</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Account Information:</strong> Name, email, phone, company name, job title, and password;</li>
              <li><strong>Profile Information:</strong> Business details and professional background;</li>
              <li><strong>Transaction Information:</strong> Details about purchases, sales, or inquiries on GridBazaar;</li>
              <li><strong>Financial Information:</strong> Banking details and cryptocurrency wallet addresses;</li>
              <li><strong>Verification Documents:</strong> Government ID and proof of address;</li>
              <li><strong>Communications:</strong> Messages you send through our platform.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">1.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Device Information:</strong> IP address, browser type, operating system;</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on pages;</li>
              <li><strong>Log Data:</strong> Access times, error logs, and referring URLs;</li>
              <li><strong>Location Data:</strong> General geographic location from IP address.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">1.3 Information from Third Parties</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Identity Verification Services:</strong> Results from verification providers;</li>
              <li><strong>Business Information Providers:</strong> Company registration details;</li>
              <li><strong>Analytics Providers:</strong> Aggregated usage statistics.</li>
            </ul>
          </section>

          {/* Section 2 - Lazy loaded */}
          <LazyLegalSection id="how-we-use">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">2. How We Use Your Information</h2>
            <p className="text-foreground/80">
              We use the information we collect for the following purposes:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.1 Service Provision</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>To create and manage your account;</li>
              <li>To provide access to VoltScout, GridBazaar, WattFund, and Academy;</li>
              <li>To process transactions and facilitate communications;</li>
              <li>To provide customer support.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.2 Security & Compliance</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>To verify user identity and prevent fraud;</li>
              <li>To comply with legal obligations including AML and KYC;</li>
              <li>To enforce our Terms of Service.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.3 Improvement & Development</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>To analyze usage patterns and improve our Services;</li>
              <li>To develop new features and functionality;</li>
              <li>To train and improve our prediction models.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.4 Communications</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>To send service-related notifications and updates;</li>
              <li>To provide market insights and price alerts;</li>
              <li>To send marketing communications (with consent).</li>
            </ul>
          </LazyLegalSection>

          {/* Section 3 */}
          <LazyLegalSection id="information-sharing">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">3. Information Sharing & Disclosure</h2>
            <p className="text-foreground/80">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.1 With Your Consent</h3>
            <p className="text-foreground/80">
              We may share your information when you have given us explicit consent.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.2 Service Providers</h3>
            <p className="text-foreground/80">
              We share information with third-party service providers who perform services on our behalf.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.3 GridBazaar Transactions</h3>
            <p className="text-foreground/80">
              Certain information may be shared with other transaction parties to complete transactions.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.4 Legal Requirements</h3>
            <p className="text-foreground/80">
              We may disclose your information if required by law or in response to valid legal requests.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.5 Business Transfers</h3>
            <p className="text-foreground/80">
              Your information may be transferred in the event of a merger, acquisition, or sale of assets.
            </p>
          </LazyLegalSection>

          {/* Section 4 */}
          <LazyLegalSection id="data-security">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">4. Data Security</h2>
            <p className="text-foreground/80">
              We implement robust technical and organizational measures to protect your personal information:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">4.1 Technical Safeguards</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Encryption:</strong> TLS 1.3 for data in transit, AES-256 for data at rest;</li>
              <li><strong>Access Controls:</strong> Role-based access on a need-to-know basis;</li>
              <li><strong>Authentication:</strong> Multi-factor authentication available;</li>
              <li><strong>Monitoring:</strong> Continuous security monitoring and intrusion detection.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">4.2 Organizational Measures</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Regular security training for employees;</li>
              <li>Incident response procedures;</li>
              <li>Regular security audits and penetration testing.</li>
            </ul>
          </LazyLegalSection>

          {/* Section 5 */}
          <LazyLegalSection id="data-retention">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">5. Data Retention</h2>
            <p className="text-foreground/80">
              We retain your personal information for as long as necessary:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Account Information:</strong> Duration of account plus seven years;</li>
              <li><strong>Transaction Records:</strong> Seven years as required by regulations;</li>
              <li><strong>Communications:</strong> Three years or as required for disputes;</li>
              <li><strong>Usage Data:</strong> Two years for analytics purposes;</li>
              <li><strong>Marketing Preferences:</strong> Until you withdraw consent.</li>
            </ul>
          </LazyLegalSection>

          {/* Section 6 */}
          <LazyLegalSection id="your-rights">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">6. Your Rights & Choices</h2>
            <p className="text-foreground/80">
              Subject to applicable law, you have the following rights:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.1 Access</h3>
            <p className="text-foreground/80">
              You can request access to and a copy of your personal information.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.2 Correction</h3>
            <p className="text-foreground/80">
              You can request correction of inaccurate or incomplete information.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.3 Deletion</h3>
            <p className="text-foreground/80">
              You can request deletion of your personal information, subject to legal exceptions.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.4 Data Portability</h3>
            <p className="text-foreground/80">
              You can receive your data in a structured, machine-readable format.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.5 Withdraw Consent</h3>
            <p className="text-foreground/80">
              You can withdraw consent for processing at any time.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.6 Marketing Opt-Out</h3>
            <p className="text-foreground/80">
              You may opt out of marketing communications at any time.
            </p>
          </LazyLegalSection>

          {/* Section 7 */}
          <LazyLegalSection id="cookies">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">7. Cookies & Tracking Technologies</h2>
            <p className="text-foreground/80">
              We use cookies and similar tracking technologies for functionality and analytics:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.1 Types of Cookies</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Essential Cookies:</strong> Required for basic functionality;</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences;</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our Services;</li>
              <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent).</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.2 Managing Cookies</h3>
            <p className="text-foreground/80">
              You can manage cookie preferences through your browser settings or our cookie management tool.
            </p>
          </LazyLegalSection>

          {/* Section 8 */}
          <LazyLegalSection id="international">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">8. International Data Transfers</h2>
            <p className="text-foreground/80">
              Your information may be transferred to and processed in countries other than Canada. We ensure appropriate safeguards are in place, including standard contractual clauses approved by relevant authorities.
            </p>
          </LazyLegalSection>

          {/* Section 9 */}
          <LazyLegalSection id="children">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">9. Children's Privacy</h2>
            <p className="text-foreground/80">
              Our Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child, we will take steps to delete that information.
            </p>
          </LazyLegalSection>

          {/* Section 10 */}
          <LazyLegalSection id="third-party">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">10. Third-Party Links & Services</h2>
            <p className="text-foreground/80">
              Our Services may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </LazyLegalSection>

          {/* Section 11 */}
          <LazyLegalSection id="canadian-law">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">11. Canadian Privacy Law Compliance</h2>
            <p className="text-foreground/80">
              We comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation, including Alberta's Personal Information Protection Act (PIPA).
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">11.1 PIPEDA Principles</h3>
            <p className="text-foreground/80">
              We adhere to the ten fair information principles set out in PIPEDA, including accountability, consent, limiting collection, and safeguards.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">11.2 Privacy Commissioner</h3>
            <p className="text-foreground/80">
              If you are not satisfied with our response to a privacy concern, you may contact the Office of the Privacy Commissioner of Canada.
            </p>
          </LazyLegalSection>

          {/* Section 12 */}
          <LazyLegalSection id="changes">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">12. Changes to This Policy</h2>
            <p className="text-foreground/80">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our Services after such modifications constitutes your acceptance of the updated Privacy Policy.
            </p>
          </LazyLegalSection>

          {/* Section 13 */}
          <LazyLegalSection id="contact">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">13. Contact Information</h2>
            <p className="text-foreground/80">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-6 mt-4">
              <p className="text-foreground/80 mb-2"><strong>WattByte Infrastructure Company</strong></p>
              <p className="text-foreground/80 mb-2">Privacy Officer</p>
              <p className="text-foreground/80 mb-2">Calgary, Alberta, Canada</p>
              <p className="text-foreground/80 mb-2">Email: privacy@wattbyte.com</p>
              <p className="text-foreground/80 mb-0">Website: wattbyte.com</p>
            </div>
          </LazyLegalSection>
        </div>
      </main>

      <LegalPageFooter />
    </div>
  );
}
