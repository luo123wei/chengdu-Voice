import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
  description: 'Voice Culture return and refund policy for Chengdu cultural gifts and souvenirs.',
}

export default function ReturnRefundPolicyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-secondary mb-8">Return &amp; Refund Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: September 11, 2026</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
            <p>We want you to love every piece you receive from Voice Culture. If something isn&apos;t right, here&apos;s how we handle returns and refunds.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">1. Return Window</h2>
            <p>You may request a return within <strong>30 days</strong> of receiving your order. Items must be unused, in their original packaging, and in the same condition you received them.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">2. Non-Returnable Items</h2>
            <p>The following items cannot be returned:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Custom or personalized products</li>
              <li>Items marked as final sale or clearance</li>
              <li>Digital products (sound packs, downloadable content)</li>
              <li>Gift cards</li>
            </ul>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">3. How to Initiate a Return</h2>
            <p>To start a return, email us at <a href="mailto:kylw02@outlook.com" className="text-primary underline">kylw02@outlook.com</a> with your order number and the reason for return. We will reply within 48 hours with return instructions and our warehouse address in Chengdu, China.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">4. Return Shipping Costs</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Defective or wrong item (our fault):</strong> We cover all return shipping costs.</li>
              <li><strong>Change of mind / personal preference:</strong> The buyer covers return shipping costs.</li>
            </ul>
            <p>We recommend using a trackable shipping method, as we cannot process refunds for items lost in transit on their way back to us.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">5. Refund Processing</h2>
            <p>Once we receive and inspect the returned item, we will notify you of the refund status within 3 business days. Approved refunds will be issued to your original payment method within 5–10 business days, depending on your bank or payment provider.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">6. Exchanges</h2>
            <p>If you wish to exchange an item for a different style or size, please follow the return process above and place a new order for the desired item. We do not hold inventory for exchanges.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">7. Damaged on Arrival</h2>
            <p>If your package arrives damaged, please take photos of the box and the product, then email us within <strong>7 days</strong> of delivery. We will arrange a replacement or full refund — no need to return the damaged item.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">8. Order Cancellation</h2>
            <p>Orders can be cancelled free of charge before they ship. Once an order has been shipped, it cannot be cancelled and must follow the standard return process.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">9. Contact</h2>
            <p>For any return or refund questions, reach us at <a href="mailto:kylw02@outlook.com" className="text-primary underline">kylw02@outlook.com</a>.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
