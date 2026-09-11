import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Voice Culture privacy policy — how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-secondary mb-8">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: September 11, 2026</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
            <p>Voice Culture (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates voiceculture.world. This policy explains what data we collect, how we use it, and your rights.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">1. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Information you provide:</strong> Name, email, shipping address, phone number, and order details when you place an order or create an account.</li>
              <li><strong>Automatically collected:</strong> IP address, browser type, pages visited, and usage data via cookies and analytics tools (Google Analytics).</li>
              <li><strong>Payment data:</strong> Payment transactions are processed by third-party providers (PayPal, Payoneer). We do not store your full card details.</li>
            </ul>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To process and ship your orders</li>
              <li>To send order confirmations and shipping updates</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To improve our website, products, and services</li>
              <li>To send marketing emails (only if you have opted in; you can unsubscribe at any time)</li>
            </ul>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">3. Cookies</h2>
            <p>We use cookies for site functionality, analytics, and improving your shopping experience. Google Analytics uses cookies to understand how visitors interact with our site. You can disable cookies in your browser settings.</p>
            <p>To opt out of Google Analytics tracking, you may install the <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>, or disable cookies entirely in your browser settings (Chrome: Settings → Privacy and security → Cookies → Block third-party cookies; Safari: Preferences → Privacy → Prevent cross-site tracking; Firefox: Preferences → Privacy &amp; Security → Enhanced Tracking Protection).</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">4. Legal Basis for Processing (GDPR)</h2>
            <p>Under the EU General Data Protection Regulation (GDPR), we process your personal data on the following legal bases:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Article 6(1)(b) — Contract performance:</strong> Processing your order, shipping, and customer service requires your name, address, and payment information.</li>
              <li><strong>Article 6(1)(c) — Legal obligation:</strong> Retaining order and tax records as required by applicable tax and customs laws.</li>
              <li><strong>Article 6(1)(f) — Legitimate interest:</strong> Using analytics to improve our website, and fraud prevention to protect our business and customers.</li>
              <li><strong>Article 6(1)(a) — Consent:</strong> Marketing emails and non-essential cookies. You may withdraw consent at any time.</li>
            </ul>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">5. International Data Transfers</h2>
            <p>Your data may be transferred to and processed in countries outside your country of residence, including the United States (Google Analytics), Singapore (PayPal), and China (our servers). We ensure appropriate safeguards are in place:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>For transfers to the United States, Google participates in the <strong>EU-U.S. Data Privacy Framework</strong> and provides Standard Contractual Clauses (SCCs).</li>
              <li>For other transfers, we rely on GDPR Article 49 (explicit consent) or Standard Contractual Clauses approved by the European Commission.</li>
              <li>You may request a copy of the safeguards by contacting us at <a href="mailto:kylw02@outlook.com" className="text-primary underline">kylw02@outlook.com</a>.</li>
            </ul>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">6. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Shipping carriers</strong> (to deliver your order)</li>
              <li><strong>Payment providers</strong> (PayPal, Payoneer — to process transactions)</li>
              <li><strong>Analytics providers</strong> (Google Analytics, aggregated and anonymized)</li>
              <li><strong>Legal authorities</strong> if required by law</li>
            </ul>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">7. Data Retention</h2>
            <p>We retain order data for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and personal data at any time.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">8. Your Rights</h2>
            <p>Depending on your location (GDPR, CCPA, etc.), you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Object to or restrict data processing</li>
            </ul>
            <p>To exercise these rights, email us at <a href="mailto:kylw02@outlook.com" className="text-primary underline">kylw02@outlook.com</a>.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">9. Security</h2>
            <p>We use industry-standard security measures including HTTPS encryption, secure password hashing (PBKDF2), and access controls. However, no method of transmission over the internet is 100% secure.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">10. Children&apos;s Privacy</h2>
            <p>Our website is not directed to children under 13. We do not knowingly collect personal data from children under 13.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">11. Changes to This Policy</h2>
            <p>We may update this policy from time to time. Changes will be posted on this page with an updated date.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">12. Contact</h2>
            <p>For privacy questions or requests, email <a href="mailto:kylw02@outlook.com" className="text-primary underline">kylw02@outlook.com</a>.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
