import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Voice Culture terms of service — the rules and conditions for using our website.',
}

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-secondary mb-8">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: September 11, 2026</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
            <p>These Terms of Service (&quot;Terms&quot;) govern your use of voiceculture.world (the &quot;Site&quot;) operated by Voice Culture (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By using this Site, you agree to these Terms.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">1. Use of the Site</h2>
            <p>You may use this Site for lawful purposes only. You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Site in any way that violates applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to any part of the Site</li>
              <li>Interfere with the proper functioning of the Site</li>
              <li>Use automated tools (bots, scrapers) to extract data without permission</li>
              <li>Reproduce or redistribute our content without authorization</li>
            </ul>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">2. Products &amp; Orders</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All product descriptions, images, and prices are subject to change without notice.</li>
              <li>We reserve the right to refuse or cancel any order at our discretion, with full refund.</li>
              <li>Pre-order and custom items may have extended production times. These will be clearly communicated on the product page.</li>
              <li>Product images are for reference; actual colors may vary slightly due to monitor settings.</li>
            </ul>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">3. Payment</h2>
            <p>We accept PayPal, Payoneer, and international wire transfer. Payment must be completed before an order is shipped. Prices are listed in USD; your bank may apply currency conversion fees.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">4. Intellectual Property</h2>
            <p>All content on this Site — including text, images, logos, product designs, and sound packs — is the property of Voice Culture or our licensors. You may not copy, reproduce, or distribute our content without written permission.</p>
            <p>Product designs are original works of Voice Culture. Knockoff or counterfeit reproduction is strictly prohibited.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">5. User-Generated Content</h2>
            <p>If you submit a review, comment, or other content, you grant us a non-exclusive, royalty-free license to use, display, and reproduce that content on our Site. You are responsible for ensuring your submissions do not infringe third-party rights.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">6. Community Voting &amp; Pre-Orders</h2>
            <p>Our design process includes community voting on future products. Voting does not obligate you to purchase, and we do not guarantee that any voted design will go into production. Pre-orders are fulfilled based on production timelines stated on each product page.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">7. Limitation of Liability</h2>
            <p>Voice Culture is not liable for any indirect, incidental, or consequential damages arising from your use of the Site or our products. Our total liability for any claim shall not exceed the amount you paid for the product in question.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">8. Third-Party Links</h2>
            <p>Our Site may contain links to third-party websites. We are not responsible for the content or practices of these external sites.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">9. Governing Law</h2>
            <p>These Terms are governed by the laws of the People&apos;s Republic of China. Any disputes shall be resolved in the courts of Chengdu, Sichuan, unless otherwise required by mandatory local consumer protection laws.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use of the Site after changes constitutes acceptance of the revised Terms.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">11. Contact</h2>
            <p>For questions about these Terms, email <a href="mailto:kylw02@outlook.com" className="text-primary underline">kylw02@outlook.com</a>.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
