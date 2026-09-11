import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Mail, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Voice Culture — Chengdu cultural gifts and souvenirs studio.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-secondary mb-4">Contact Us</h1>
          <p className="text-gray-500 mb-10">Have a question? We&apos;d love to hear from you.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-cream/40 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-secondary mb-1">Email</h3>
              <a href="mailto:kylw02@outlook.com" className="text-sm text-primary hover:underline">kylw02@outlook.com</a>
            </div>

            <div className="bg-cream/40 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-secondary mb-1">Studio</h3>
              <p className="text-sm text-gray-600">Chengdu, Sichuan, China</p>
            </div>

            <div className="bg-cream/40 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-secondary mb-1">Response Time</h3>
              <p className="text-sm text-gray-600">Within 24 hours</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-xl font-bold text-secondary mb-6">Send Us a Message</h2>
            <form action="mailto:kylw02@outlook.com" method="post" encType="text/plain" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-sm"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-sm resize-none"
                  placeholder="Tell us more..."
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-black transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="mt-10 text-center text-gray-500 text-sm">
            <p>For order inquiries, please include your order number for faster assistance.</p>
            <p className="mt-2">We typically respond within 24 hours, Monday–Friday (China Standard Time).</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
