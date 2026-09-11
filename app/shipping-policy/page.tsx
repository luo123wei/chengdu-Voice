import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Voice Culture shipping policy — worldwide delivery from Chengdu, China.',
}

export default function ShippingPolicyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-secondary mb-8">Shipping Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: September 11, 2026</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
            <p>We ship worldwide from our studio in Chengdu, Sichuan, China. Below is everything you need to know about how we deliver your order.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">1. Processing Time</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>In-stock items:</strong> Shipped within 1–3 business days.</li>
              <li><strong>Pre-order items:</strong> Shipped within 7–14 business days after the pre-order period ends.</li>
              <li><strong>Custom or personalized items:</strong> Shipped within 10–20 business days after production.</li>
            </ul>
            <p>Orders are not processed or shipped on weekends or Chinese public holidays.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">2. Shipping Methods &amp; Time</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Region</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Standard (7–15 days)</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Express (3–7 days)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 px-4 py-2">United States</td><td className="border border-gray-200 px-4 py-2">$4.99</td><td className="border border-gray-200 px-4 py-2">$10.99</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Canada</td><td className="border border-gray-200 px-4 py-2">$6.99</td><td className="border border-gray-200 px-4 py-2">$12.99</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">United Kingdom</td><td className="border border-gray-200 px-4 py-2">$5.99</td><td className="border border-gray-200 px-4 py-2">$11.99</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">EU (Germany, France, Italy, Spain)</td><td className="border border-gray-200 px-4 py-2">$5.99–$6.99</td><td className="border border-gray-200 px-4 py-2">$11.99–$12.99</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Australia / New Zealand</td><td className="border border-gray-200 px-4 py-2">$7.99</td><td className="border border-gray-200 px-4 py-2">$14.99</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Japan</td><td className="border border-gray-200 px-4 py-2">$5.99</td><td className="border border-gray-200 px-4 py-2">$11.99</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Rest of World</td><td className="border border-gray-200 px-4 py-2">$9.99</td><td className="border border-gray-200 px-4 py-2">$18.99</td></tr>
                </tbody>
              </table>
            </div>
            <p>Delivery times are estimates and not guaranteed. Actual transit time depends on the destination country&apos;s postal service and customs clearance.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">3. Free Shipping Threshold</h2>
            <p>We offer <strong>free standard shipping</strong> when your order subtotal reaches the free-shipping threshold for your region (typically $49.99–$89.99 depending on destination). The threshold is displayed at checkout.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">4. Carriers We Use</h2>
            <p>Depending on destination and service level, we ship via China Post, DHL, FedEx, or local postal partners. You will receive a tracking number by email once your order ships.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">5. Customs, Duties &amp; Taxes</h2>
            <p>International orders may be subject to import duties and taxes imposed by the destination country. These charges are the responsibility of the recipient. We have no control over customs processing times or fees.</p>
            <p>For most orders under $800 USD shipped to the United States, no import duty applies. EU customers should expect VAT charges on orders above €150.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">6. Tracking Your Order</h2>
            <p>A tracking link will be emailed to you once your order ships. You can also track your package by logging into your account at <a href="/" className="text-primary underline">voiceculture.world</a> and viewing your order history.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">7. Lost or Delayed Packages</h2>
            <p>If your package is significantly delayed (more than 30 days for standard, 15 days for express), please contact us at <a href="mailto:kylw02@outlook.com" className="text-primary underline">kylw02@outlook.com</a> and we will open an inquiry with the carrier. If the carrier confirms the package is lost, we will issue a full refund or resend your order — your choice.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">8. Shipping Restrictions</h2>
            <p>We currently do not ship to countries under UN or US trade embargoes. If your country is not available at checkout, please contact us and we will explore alternatives.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">9. Contact</h2>
            <p>For any shipping questions, reach us at <a href="mailto:kylw02@outlook.com" className="text-primary underline">kylw02@outlook.com</a>.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
