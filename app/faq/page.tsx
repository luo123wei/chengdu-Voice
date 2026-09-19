import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'FAQ | Voice Culture',
  description: 'Frequently asked questions about shipping, tracking, returns, payment methods, customs duties, pre-orders and more at Voice Culture.',
  alternates: { canonical: '/faq' },
};

const faqs = [
  {
    q: 'How long does shipping take, and what does it cost?',
    a: (
      <>
        <p>
          We ship worldwide from Chengdu, China. Standard shipping usually takes 5–7 business days,
          and express shipping takes 2–3 business days after your order is dispatched. Shipping costs
          depend on your country and the service you choose — see our{' '}
          <Link href="/shipping-policy" className="underline underline-offset-2 hover:text-gray-600">Shipping Policy</Link>{' '}
          for the exact rates and free-shipping threshold.
        </p>
      </>
    ),
  },
  {
    q: 'Can I track my order?',
    a: (
      <p>
        Yes. Once your order is dispatched, we&apos;ll email you a shipping confirmation with a
        tracking number so you can follow your parcel all the way to your door.
      </p>
    ),
  },
  {
    q: 'What is your return and refund policy?',
    a: (
      <p>
        We accept returns within 30 days of delivery. If something isn&apos;t right, contact us and
        we&apos;ll sort it out. Full details and conditions are described in our{' '}
        <Link href="/return-refund-policy" className="underline underline-offset-2 hover:text-gray-600">Return &amp; Refund Policy</Link>.
      </p>
    ),
  },
  {
    q: 'What payment methods do you accept?',
    a: (
      <p>
        We accept PayPal, Payoneer and international bank transfer. After you place an order, our
        team will email you within 24 hours with the payment details, or you can check out instantly
        with PayPal at checkout.
      </p>
    ),
  },
  {
    q: 'Will I have to pay customs or import duties?',
    a: (
      <p>
        Possibly. Import duties, taxes and brokerage fees are not included in the item price or
        shipping cost and are the buyer&apos;s responsibility. We declare all parcels honestly and at
        their full value — we don&apos;t mark orders as gifts or under-declare them.
      </p>
    ),
  },
  {
    q: 'What is the difference between pre-order and in-stock items?',
    a: (
      <p>
        Every piece follows the same path: we design it, you vote on it, the winning designs open for
        pre-order, and then we produce in small batches. In-stock items ship within 24 hours.
        Pre-order items are made after the pre-order window closes and ship by the timeframe noted on
        each product page.
      </p>
    ),
  },
  {
    q: 'Are the products handmade?',
    a: (
      <p>
        All of our products are designed in-house at our studio in Chengdu and produced in small
        batches with local artisan partners, so many steps involve handwork. Products that are fully
        or partly handmade are marked as such on their product pages.
      </p>
    ),
  },
  {
    q: 'How do I contact you?',
    a: (
      <p>
        Email us anytime at <a href="mailto:kylw02@outlook.com" className="underline underline-offset-2 hover:text-gray-600">kylw02@outlook.com</a> —
        the same address you&apos;ll find at the bottom of every page. We reply within 24 hours.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-500 mb-10">
            Everything you need to know about ordering, shipping and our design-to-production process.
          </p>
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-6">
                <h2 className="font-serif text-lg md:text-xl font-bold mb-3">{faq.q}</h2>
                <div className="text-gray-600 leading-relaxed space-y-3">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
