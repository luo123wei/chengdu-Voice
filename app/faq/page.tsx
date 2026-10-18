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
    q: 'What is Voice Culture?',
    a: (
      <p>
        Voice Culture is a small design studio based in Chengdu, China. We design small-batch objects and
        gifts inspired by the city&apos;s culture, everyday life and visual language, and ship them
        worldwide. Read more on our{' '}
        <Link href="/about" className="underline underline-offset-2 hover:text-gray-600">About page</Link>.
      </p>
    ),
  },
  {
    q: 'What does Voice Culture sell?',
    a: (
      <p>
        Two kinds of things. Physical pieces made in small batches from our Chengdu studio — enamel pins
        and brooches, stationery and small objects for the home — and digital Chengdu sound recordings,
        including a full Sound Library you can download instantly. Browse everything in the{' '}
        <Link href="/shop" className="underline underline-offset-2 hover:text-gray-600">shop</Link>.
      </p>
    ),
  },
  {
    q: 'How does the voting model work?',
    a: (
      <p>
        New designs are published as open concepts before they are made. Visitors vote for the ones they
        want, and when a concept reaches its vote goal we open pre-orders and put it into small-batch
        production. You decide what we make next — see the{' '}
        <Link href="/shop?tab=design" className="underline underline-offset-2 hover:text-gray-600">open votes</Link>.
      </p>
    ),
  },
  {
    q: 'What is the Chengdu Sound Library?',
    a: (
      <p>
        It is a collection of sounds recorded in Chengdu — teahouses, mahjong tables, street life and
        Sichuan opera percussion — delivered as an instant download after purchase. Selected recordings
        are also free to listen to on the{' '}
        <Link href="/free-sounds" className="underline underline-offset-2 hover:text-gray-600">free sounds page</Link>.
      </p>
    ),
  },
  {
    q: 'Do you ship worldwide?',
    a: (
      <p>
        Yes. Physical orders ship from Chengdu, China, to addresses worldwide, and pre-orders ship first
        as soon as a piece goes into production.
      </p>
    ),
  },
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
        We accept returns within 30 days of delivery. Custom or personalized pieces and digital products
        can&apos;t be returned, and any item that arrived damaged is always covered. Full details and
        conditions are described in our{' '}
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
        pre-order, and then we produce in small batches. In-stock items are packed and dispatched within
        24 hours, while made-to-order and custom pieces need 3–5 business days of hand-crafting before
        they ship. Pre-order items are made after the pre-order window closes and ship by the timeframe
        noted on each product page.
      </p>
    ),
  },
  {
    q: 'Are the products handmade?',
    a: (
      <p>
        Everything is designed in-house at our studio in Chengdu. Wax seal dies are machine-engraved for
        crisp, clean lines, then deburred and finished by hand; other pieces are assembled, checked and
        finished by hand as well. So while most items involve handwork, only pieces that are fully
        hand-made are labelled that way on their product pages.
      </p>
    ),
  },
  {
    q: 'How do I get 10% off my first order?',
    a: (
      <p>
        Join the studio list with your email address on any page of the site. You will see a welcome code
        for 10% off your first order, plus votes on new designs and early access to pre-orders.
      </p>
    ),
  },
  {
    q: 'How do I contact you?',
    a: (
      <p>
        Email us anytime at <a href="mailto:hello@voiceculture.world" className="underline underline-offset-2 hover:text-gray-600">hello@voiceculture.world</a> —
        the same address you&apos;ll find at the bottom of every page. We reply within 24 hours.
      </p>
    ),
  },
];

// FAQPage structured data (plain-text mirror of the visible Q&A below)
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Voice Culture?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Voice Culture is a small design studio based in Chengdu, China. We design small-batch objects and gifts inspired by the city's culture, everyday life and visual language, and ship them worldwide. Read more on our About page.",
      },
    },
    {
      '@type': 'Question',
      name: 'What does Voice Culture sell?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Two kinds of things. Physical pieces made in small batches from our Chengdu studio \u2014 enamel pins and brooches, stationery and small objects for the home \u2014 and digital Chengdu sound recordings, including a full Sound Library you can download instantly. Browse everything in the shop.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the voting model work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'New designs are published as open concepts before they are made. Visitors vote for the ones they want, and when a concept reaches its vote goal we open pre-orders and put it into small-batch production. You decide what we make next \u2014 see the open votes.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Chengdu Sound Library?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It is a collection of sounds recorded in Chengdu \u2014 teahouses, mahjong tables, street life and Sichuan opera percussion \u2014 delivered as an instant download after purchase. Selected recordings are also free to listen to on the free sounds page.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you ship worldwide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Physical orders ship from Chengdu, China, to addresses worldwide, and pre-orders ship first as soon as a piece goes into production.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does shipping take, and what does it cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "We ship worldwide from Chengdu, China. Standard shipping usually takes 5\u20137 business days, and express shipping takes 2\u20133 business days after your order is dispatched. Shipping costs depend on your country and the service you choose \u2014 see our Shipping Policy for the exact rates and free-shipping threshold.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I track my order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Once your order is dispatched, we'll email you a shipping confirmation with a tracking number so you can follow your parcel all the way to your door.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is your return and refund policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "We accept returns within 30 days of delivery. Custom or personalized pieces and digital products can't be returned, and any item that arrived damaged is always covered. Full details and conditions are described in our Return & Refund Policy.",
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept PayPal, Payoneer and international bank transfer. After you place an order, our team will email you within 24 hours with the payment details, or you can check out instantly with PayPal at checkout.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will I have to pay customs or import duties?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Possibly. Import duties, taxes and brokerage fees are not included in the item price or shipping cost and are the buyer's responsibility. We declare all parcels honestly and at their full value \u2014 we don't mark orders as gifts or under-declare them.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between pre-order and in-stock items?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every piece follows the same path: we design it, you vote on it, the winning designs open for pre-order, and then we produce in small batches. In-stock items are packed and dispatched within 24 hours, while made-to-order and custom pieces need 3\u20135 business days of hand-crafting before they ship. Pre-order items are made after the pre-order window closes and ship by the timeframe noted on each product page.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the products handmade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Everything is designed in-house at our studio in Chengdu. Wax seal dies are machine-engraved for crisp, clean lines, then deburred and finished by hand; other pieces are assembled, checked and finished by hand as well. So while most items involve handwork, only pieces that are fully hand-made are labelled that way on their product pages.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get 10% off my first order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Join the studio list with your email address on any page of the site. You will see a welcome code for 10% off your first order, plus votes on new designs and early access to pre-orders.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I contact you?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Email us anytime at hello@voiceculture.world \u2014 the same address you'll find at the bottom of every page. We reply within 24 hours.",
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
