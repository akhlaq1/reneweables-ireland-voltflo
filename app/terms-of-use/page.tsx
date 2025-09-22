import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { Shield, FileText, User, AlertTriangle, Copyright, Scale, Gavel } from "lucide-react"

export default function TermsOfUsePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showBackButton={true} />

      <div className="flex-1 bg-gradient-to-b from-green-50 to-white">
        <div className="container px-4 md:px-6 py-8 md:py-12 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Terms of Use
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Effective June 2025 - Please read these terms carefully before using our platform.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {/* Section 1 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Scope of Service</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Voltflo is an informational and educational tool designed to help homeowners explore typical 
                    upgrade costs and financing options. It does not provide formal quotes, issue financial advice, 
                    or initiate loan applications. All pricing and savings figures are estimates based on national data 
                    and are clearly marked as such.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Personal Use Only</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Voltflo is intended for personal, non-commercial use. You may not use the platform to offer 
                    services to others or repackage the content.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Responsibility</h2>
                  <p className="text-gray-600 leading-relaxed">
                    You are responsible for the accuracy of any information you submit through the platform. You 
                    must not use false identities or provide misleading data.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Disclaimer of Guarantees</h2>
                  <p className="text-gray-600 leading-relaxed">
                    All savings estimates, upgrade costs, and loan repayments are indicative only. Final pricing is 
                    subject to contractor assessment and Credit Union approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Copyright className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Intellectual Property</h2>
                  <div className="space-y-3">
                    <p className="text-gray-600 leading-relaxed">
                      All platform content, visuals, and calculations are the property of Voltflo.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      You may not copy, reuse, or publish any platform content, calculations, or visuals without 
                      permission.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Scale className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Limitation of Liability</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Voltflo accepts no liability for any decisions made based on estimates, nor for any third-party 
                    contractor or lender outcome.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 7 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Gavel className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Governing Law</h2>
                  <p className="text-gray-600 leading-relaxed">
                    These terms are governed by Irish law. Any disputes will be handled in Irish courts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mb-12">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Notice</h3>
                <p className="text-amber-800 leading-relaxed">
                  By using Voltflo, you acknowledge that all estimates are indicative and that actual costs, 
                  savings, and financing terms may vary significantly. Always consult with qualified professionals 
                  and your Credit Union for formal advice and final pricing.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-green-50 rounded-xl p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Questions about our Terms?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about these terms of use, please don't hesitate to contact us.
            </p>
            <a 
              href="mailto:support@voltflo.com"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FileText className="h-4 w-4" />
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