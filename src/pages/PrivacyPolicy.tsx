import { Bitcoin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedLogo } from '@/components/EnhancedLogo';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> January 1, 2025 | <strong>Last Updated:</strong> December 25, 2024
          </p>

          <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-0">
              WattByte Infrastructure Company ("WattByte," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and services (collectively, the "Services"). Please read this policy carefully to understand our practices regarding your personal data.
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

          {/* Section 1 */}
          <section id="information-collected" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">1. Information We Collect</h2>
            <p className="text-foreground/80">
              We collect information in several ways depending on how you interact with our Services:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">1.1 Information You Provide Directly</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Account Information:</strong> Name, email address, phone number, company name, job title, and password when you create an account;</li>
              <li><strong>Profile Information:</strong> Business details, professional background, and preferences you choose to share;</li>
              <li><strong>Transaction Information:</strong> Details about purchases, sales, or inquiries made through GridBazaar, including asset descriptions, pricing, and transaction history;</li>
              <li><strong>Financial Information:</strong> Banking details, cryptocurrency wallet addresses (stored in hashed format), and payment information necessary to process transactions;</li>
              <li><strong>Verification Documents:</strong> Government-issued identification, proof of address, and corporate documentation for identity verification purposes;</li>
              <li><strong>Communications:</strong> Messages you send to us or other users through our platform, support inquiries, and feedback;</li>
              <li><strong>Survey Responses:</strong> Information you provide in response to surveys or research requests.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">1.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Device Information:</strong> IP address, browser type and version, operating system, device identifiers, and mobile network information;</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on pages, click patterns, search queries, and navigation paths;</li>
              <li><strong>Log Data:</strong> Access times, error logs, and referring URLs;</li>
              <li><strong>Location Data:</strong> General geographic location inferred from your IP address;</li>
              <li><strong>Performance Data:</strong> Application performance metrics and crash reports.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">1.3 Information from Third Parties</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Identity Verification Services:</strong> Results from identity verification providers;</li>
              <li><strong>Business Information Providers:</strong> Company registration details and business credit information;</li>
              <li><strong>Social Media:</strong> If you link social media accounts, we may receive profile information from those platforms;</li>
              <li><strong>Analytics Providers:</strong> Aggregated and anonymized usage statistics.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="how-we-use" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">2. How We Use Your Information</h2>
            <p className="text-foreground/80">
              We use the information we collect for the following purposes:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.1 Service Provision</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>To create and manage your account;</li>
              <li>To provide access to VoltScout, GridBazaar, WattFund, Academy, and hosting services;</li>
              <li>To process transactions and facilitate communications between users;</li>
              <li>To deliver energy market data, predictions, and analytics;</li>
              <li>To provide customer support and respond to inquiries.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.2 Security & Compliance</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>To verify user identity and prevent fraud;</li>
              <li>To detect and prevent security threats and unauthorized access;</li>
              <li>To comply with legal obligations, including anti-money laundering (AML) and know-your-customer (KYC) requirements;</li>
              <li>To enforce our Terms of Service.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.3 Improvement & Development</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>To analyze usage patterns and improve our Services;</li>
              <li>To develop new features and functionality;</li>
              <li>To conduct research and analytics;</li>
              <li>To train and improve our prediction models and algorithms.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">2.4 Communications</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>To send service-related notifications, updates, and alerts;</li>
              <li>To provide market insights and energy price alerts you have subscribed to;</li>
              <li>To send marketing communications (with your consent, where required);</li>
              <li>To respond to your inquiries and provide support.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="information-sharing" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">3. Information Sharing & Disclosure</h2>
            <p className="text-foreground/80">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.1 With Your Consent</h3>
            <p className="text-foreground/80">
              We may share your information when you have given us explicit consent to do so.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.2 Service Providers</h3>
            <p className="text-foreground/80">
              We share information with third-party service providers who perform services on our behalf, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Cloud hosting and infrastructure providers;</li>
              <li>Payment processors and financial institutions;</li>
              <li>Identity verification services;</li>
              <li>Analytics and monitoring services;</li>
              <li>Customer support platforms;</li>
              <li>Email and communication services.</li>
            </ul>
            <p className="text-foreground/80">
              These providers are contractually obligated to protect your information and may only use it for the specific purposes for which it was shared.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.3 GridBazaar Transactions</h3>
            <p className="text-foreground/80">
              When you engage in transactions on GridBazaar, certain information may be shared with other parties to the transaction as necessary to complete the transaction, including contact information and transaction details.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.4 Legal Requirements</h3>
            <p className="text-foreground/80">
              We may disclose your information if required to do so by law or in response to valid requests by public authorities, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Court orders and subpoenas;</li>
              <li>Government or regulatory agency requests;</li>
              <li>Law enforcement investigations;</li>
              <li>To protect our rights, privacy, safety, or property.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.5 Business Transfers</h3>
            <p className="text-foreground/80">
              In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change and any choices you may have regarding your information.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">3.6 Aggregated or De-identified Data</h3>
            <p className="text-foreground/80">
              We may share aggregated or de-identified information that cannot reasonably be used to identify you for research, analytics, or other purposes.
            </p>
          </section>

          {/* Section 4 */}
          <section id="data-security" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">4. Data Security</h2>
            <p className="text-foreground/80">
              We implement robust technical and organizational measures to protect your personal information:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">4.1 Technical Safeguards</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using TLS 1.3. Sensitive data at rest is encrypted using AES-256;</li>
              <li><strong>Access Controls:</strong> Role-based access controls limit employee access to personal data on a need-to-know basis;</li>
              <li><strong>Authentication:</strong> Multi-factor authentication is available and recommended for all accounts;</li>
              <li><strong>Monitoring:</strong> Continuous security monitoring and intrusion detection systems;</li>
              <li><strong>Wallet Security:</strong> Cryptocurrency wallet addresses are stored using one-way cryptographic hashing.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">4.2 Organizational Measures</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Regular security training for all employees;</li>
              <li>Incident response procedures;</li>
              <li>Regular security audits and penetration testing;</li>
              <li>Vendor security assessments.</li>
            </ul>

            <p className="text-foreground/80 mt-4">
              While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 5 */}
          <section id="data-retention" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">5. Data Retention</h2>
            <p className="text-foreground/80">
              We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Account Information:</strong> Retained for the duration of your account plus seven (7) years after account closure for legal and regulatory compliance;</li>
              <li><strong>Transaction Records:</strong> Retained for seven (7) years as required by financial regulations;</li>
              <li><strong>Communications:</strong> Retained for three (3) years or as required for dispute resolution;</li>
              <li><strong>Usage Data:</strong> Retained for two (2) years for analytics purposes;</li>
              <li><strong>Marketing Preferences:</strong> Retained until you withdraw consent.</li>
            </ul>
            <p className="text-foreground/80 mt-4">
              Upon expiration of the retention period, personal information is securely deleted or anonymized.
            </p>
          </section>

          {/* Section 6 */}
          <section id="your-rights" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">6. Your Rights & Choices</h2>
            <p className="text-foreground/80">
              Subject to applicable law, you have the following rights regarding your personal information:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.1 Access</h3>
            <p className="text-foreground/80">
              You have the right to request access to the personal information we hold about you and to receive a copy of that information.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.2 Correction</h3>
            <p className="text-foreground/80">
              You have the right to request correction of inaccurate or incomplete personal information.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.3 Deletion</h3>
            <p className="text-foreground/80">
              You have the right to request deletion of your personal information, subject to certain exceptions (such as legal retention requirements).
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.4 Data Portability</h3>
            <p className="text-foreground/80">
              You have the right to receive your personal information in a structured, commonly used, and machine-readable format.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.5 Withdraw Consent</h3>
            <p className="text-foreground/80">
              Where we rely on consent to process your information, you have the right to withdraw that consent at any time.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.6 Marketing Opt-Out</h3>
            <p className="text-foreground/80">
              You may opt out of marketing communications at any time by clicking the "unsubscribe" link in any marketing email or by contacting us directly.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">6.7 Exercising Your Rights</h3>
            <p className="text-foreground/80">
              To exercise any of these rights, please contact us at privacy@wattbyte.com. We will respond to your request within thirty (30) days. We may require verification of your identity before processing your request.
            </p>
          </section>

          {/* Section 7 */}
          <section id="cookies" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">7. Cookies & Tracking Technologies</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">7.1 Types of Cookies We Use</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li><strong>Essential Cookies:</strong> Required for the operation of our Services, including authentication and security;</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings;</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Services;</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (only with your consent).</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.2 Managing Cookies</h3>
            <p className="text-foreground/80">
              You can control cookies through your browser settings. Most browsers allow you to refuse cookies or delete existing cookies. Note that disabling cookies may affect the functionality of our Services.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6">7.3 Do Not Track</h3>
            <p className="text-foreground/80">
              Our Services do not currently respond to "Do Not Track" signals from browsers.
            </p>
          </section>

          {/* Section 8 */}
          <section id="international" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">8. International Data Transfers</h2>
            <p className="text-foreground/80">
              WattByte is headquartered in Canada. If you access our Services from outside Canada, your information may be transferred to, stored, and processed in Canada or other countries where our service providers operate.
            </p>
            <p className="text-foreground/80">
              When we transfer personal information across borders, we ensure appropriate safeguards are in place, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Standard contractual clauses approved by relevant data protection authorities;</li>
              <li>Data processing agreements with service providers;</li>
              <li>Compliance with applicable data protection laws.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="children" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">9. Children's Privacy</h2>
            <p className="text-foreground/80">
              Our Services are not intended for individuals under the age of eighteen (18). We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at privacy@wattbyte.com, and we will take steps to delete such information.
            </p>
          </section>

          {/* Section 10 */}
          <section id="third-party" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">10. Third-Party Links & Services</h2>
            <p className="text-foreground/80">
              Our Services may contain links to third-party websites, services, or applications that are not operated by us. This Privacy Policy does not apply to third-party services. We encourage you to review the privacy policies of any third-party services you access.
            </p>
            <p className="text-foreground/80">
              We are not responsible for the privacy practices or content of third-party services.
            </p>
          </section>

          {/* Section 11 */}
          <section id="canadian-law" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">11. Canadian Privacy Law Compliance</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">11.1 PIPEDA Compliance</h3>
            <p className="text-foreground/80">
              We comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation. Our privacy practices are based on the ten fair information principles under PIPEDA:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Accountability</li>
              <li>Identifying Purposes</li>
              <li>Consent</li>
              <li>Limiting Collection</li>
              <li>Limiting Use, Disclosure, and Retention</li>
              <li>Accuracy</li>
              <li>Safeguards</li>
              <li>Openness</li>
              <li>Individual Access</li>
              <li>Challenging Compliance</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6">11.2 Privacy Commissioner</h3>
            <p className="text-foreground/80">
              If you have concerns about our privacy practices that we have not addressed to your satisfaction, you have the right to file a complaint with the Office of the Privacy Commissioner of Canada at www.priv.gc.ca.
            </p>
          </section>

          {/* Section 12 */}
          <section id="changes" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">12. Changes to This Policy</h2>
            <p className="text-foreground/80">
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. If we make material changes, we will notify you by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
              <li>Posting a notice on our website;</li>
              <li>Sending you an email notification;</li>
              <li>Updating the "Last Updated" date at the top of this policy.</li>
            </ul>
            <p className="text-foreground/80 mt-4">
              We encourage you to review this Privacy Policy periodically. Your continued use of our Services after any changes indicates your acceptance of the updated policy.
            </p>
          </section>

          {/* Section 13 */}
          <section id="contact" className="mb-10">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">13. Contact Information</h2>
            <p className="text-foreground/80">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-6 mt-4">
              <p className="text-foreground font-semibold mb-2">WattByte Infrastructure Company</p>
              <p className="text-foreground/80 mb-1">Privacy Officer</p>
              <p className="text-foreground/80 mb-1">Email: privacy@wattbyte.com</p>
              <p className="text-foreground/80 mb-1">General Inquiries: contact@wattbyte.com</p>
              <p className="text-foreground/80 mb-0">Website: www.wattbyte.com</p>
            </div>
            <p className="text-foreground/80 mt-4">
              We will respond to privacy-related inquiries within thirty (30) days.
            </p>
          </section>

          <div className="border-t border-border pt-8 mt-12">
            <p className="text-sm text-muted-foreground">
              By using our Services, you acknowledge that you have read and understood this Privacy Policy.
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
