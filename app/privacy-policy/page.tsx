import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { Shield, Mail, Clock, Users, Lock, FileText, CheckCircle2 } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showBackButton={true} />

      <div className="flex-1 bg-gradient-to-b from-green-50 to-white">
        <div className="container px-4 md:px-6 py-8 md:py-12 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Effective June 2025 - We're committed to protecting your privacy and being transparent about how we handle your data.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {/* Section 1 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Who We Are</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Voltflo is a digital platform that helps homeowners explore energy upgrade options - including 
                    typical costs, grants, and green finance - through a simple, educational online journey. The 
                    platform is made available to users directly and via participating financial institutions.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">2. What Data We Collect</h2>
                  <p className="text-gray-600 mb-4">
                    We collect only the minimum personal data necessary to deliver our service, such as:
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Name',
                      'Email address', 
                      'Optional phone number (if you choose to provide it)',
                      'Interaction logs (e.g. confirmation emails sent, reports sent by email, or calls booked)',
                      'Non-personal technical data (e.g. browser type, device, location)'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Data</h2>
                  <p className="text-gray-600 mb-4">We use your data to:</p>
                  <ul className="space-y-2">
                    {[
                      'Send you your personalised home energy plan',
                      'Improve our platform and services',
                      'Share your data with your Credit Union only if you choose to book a call or apply for a loan',
                      'Send reminder emails (e.g. call confirmations or follow-ups) only when you\'ve explicitly booked a call or requested contact'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Our Legal Basis for Processing</h2>
                  <p className="text-gray-600 mb-4">We rely on:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        <strong>Consent:</strong> When you request your plan, or book a call
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        <strong>Legitimate interest:</strong> To support platform functionality, basic performance analytics, and security - never for direct marketing
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">5. How Long We Store Data</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Your data is stored securely for up to 6 months, unless required longer for compliance or follow-up purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
                  <p className="text-gray-600 mb-4">Under GDPR, you have the right to:</p>
                  <ul className="space-y-2 mb-4">
                    {[
                      'Access or correct your data',
                      'Request deletion',
                      'Withdraw consent at any time'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-600">
                    You can contact us at{' '}
                    <a 
                      href="mailto:support@voltflo.com" 
                      className="text-green-600 hover:text-green-700 underline font-medium"
                    >
                      support@voltflo.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 7 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Who We Share Data With</h2>
                  <p className="text-gray-600 mb-4">Your data is shared with:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Your Credit Union only if you proceed to book a call or apply for a loan
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Trusted service providers (e.g. for email delivery, hosting, or analytics), who only process data on our behalf and under strict data protection agreements
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 8 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Security Measures</h2>
                  <p className="text-gray-600 leading-relaxed">
                    All data is stored on secure, GDPR-compliant infrastructure (e.g. AWS). Access is restricted and monitored.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 9 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Policy Changes</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We may update this policy. The most recent version will always be posted on our website.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-green-50 rounded-xl p-6 md:p-8 text-center mt-12">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Questions about our Privacy Policy?</h3>
            <p className="text-gray-600 mb-4">
              We're here to help. Contact us if you have any questions or concerns.
            </p>
            <a 
              href="mailto:support@voltflo.com"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link 
              href="/"
              className="text-green-600 hover:text-green-700 font-medium underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 