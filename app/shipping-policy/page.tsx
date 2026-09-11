import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { db } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Voice Culture shipping policy — worldwide delivery from Chengdu, China.',
}

type RateRow = {
  label: string
  standard: string   // 格式化的显示字符串（单值或区间）
  express: string
}

function groupRates(rates: { country: string; standard: number; express: number; freeThreshold: number }[]): RateRow[] {
  const rows: RateRow[] = []
  const euCountries = ['Germany', 'France', 'Italy', 'Spain']
  const asiaCountries = ['Australia', 'New Zealand']

  // 先处理合并分组
  const grouped = new Set<string>()

  // EU 四国合并
  const euRates = rates.filter(r => euCountries.includes(r.country))
  if (euRates.length) {
    grouped.add('Germany'); grouped.add('France'); grouped.add('Italy'); grouped.add('Spain')
    const stdVals = euRates.map(r => r.standard)
    const expVals = euRates.map(r => r.express)
    const fmt = (arr: number[]) => {
      const min = Math.min(...arr), max = Math.max(...arr)
      return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}–$${max.toFixed(2)}`
    }
    rows.push({
      label: 'EU (Germany, France, Italy, Spain)',
      standard: fmt(stdVals),
      express: fmt(expVals),
    })
  }

  // Australia / New Zealand 合并
  const anz = rates.filter(r => asiaCountries.includes(r.country))
  if (anz.length) {
    anz.forEach(r => grouped.add(r.country))
    rows.push({
      label: anz.length === 2 ? 'Australia / New Zealand' : anz[0].country,
      standard: `$${anz[0].standard.toFixed(2)}`,
      express: `$${anz[0].express.toFixed(2)}`,
    })
  }

  // 单独国家：US / Canada / UK / Japan / Rest of World (Other)
  const soloOrder = ['United States', 'Canada', 'United Kingdom', 'Japan', 'Other']
  for (const name of soloOrder) {
    const r = rates.find(x => x.country === name)
    if (!r) continue
    grouped.add(name)
    rows.push({
      label: name === 'Other' ? 'Rest of World' : name,
      standard: `$${r.standard.toFixed(2)}`,
      express: `$${r.express.toFixed(2)}`,
    })
  }

  // 兜底：所有剩余未分组国家
  for (const r of rates) {
    if (!grouped.has(r.country)) {
      rows.push({
        label: r.country,
        standard: `$${r.standard.toFixed(2)}`,
        express: `$${r.express.toFixed(2)}`,
      })
    }
  }

  return rows
}

export default async function ShippingPolicyPage() {
  const rates = await db.shippingRates.getAll()
  const rows = groupRates(rates)

  // 免邮门槛说明（取各地区阈值的范围）
  const thresholds = rates.map(r => r.freeThreshold)
  const minT = Math.min(...thresholds), maxT = Math.max(...thresholds)
  const freeThresholdText = minT === maxT ? `$${minT.toFixed(2)}` : `$${minT.toFixed(2)}–$${maxT.toFixed(2)}`

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

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">2. Shipping Rates</h2>
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
                  {rows.map((row, i) => (
                    <tr key={i}>
                      <td className="border border-gray-200 px-4 py-2">{row.label}</td>
                      <td className="border border-gray-200 px-4 py-2">{row.standard}</td>
                      <td className="border border-gray-200 px-4 py-2">{row.express}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Rates above match our live checkout pricing. Updated whenever shipping rates change.
            </p>
            <p>Delivery times are estimates and not guaranteed. Actual transit time depends on the destination country&apos;s postal service and customs clearance.</p>

            <h2 className="text-xl font-bold text-secondary mt-8 mb-3">3. Free Shipping Threshold</h2>
            <p>We offer <strong>free standard shipping</strong> when your order subtotal reaches the free-shipping threshold for your region — typically <strong>{freeThresholdText}</strong>. The exact threshold for your destination is displayed at checkout before you pay.</p>

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
