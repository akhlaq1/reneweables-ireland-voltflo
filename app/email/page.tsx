export default function EmailTemplate() {
  return (
    <div className="max-w-2xl mx-auto bg-white">
      {/* Email Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Path to Energy Independence Starts Here</h1>
            <p className="text-blue-100 text-sm mb-2">
              Powered by your Credit Union, personalised solar insights and finance options inside.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm">Solar Energy Solutions</p>
            <p className="text-xs text-blue-100">Powered by Voltflo</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your Energy Upgrade Plan is Ready</h2>
        <p className="text-gray-700 mb-4">
          Backed by your Credit Union, this plan outlines your potential savings, your solar system size,
          and financing options tailored to your home.
        </p>

        {/* Key Benefits Section */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            💶 Key Highlights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">€[Insert Amount]</div>
              <div className="text-sm text-gray-600">Estimated Annual Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">[Insert %]</div>
              <div className="text-sm text-gray-600">Potential Energy Offset</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">[Insert tCO₂]</div>
              <div className="text-sm text-gray-600">Estimated CO₂ Reduction</div>
            </div>
          </div>
        </div>

        {/* Financial Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-blue-800 mb-2">🏦 Financing Made Simple</h3>
          <p className="text-gray-700 mb-3">Your Credit Union offers a flexible Green Loan</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Monthly Payment:</span>
              <span className="font-semibold text-blue-600">€[Loan Amount] over [Term]</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-gray-800">
                Estimated Net Monthly Benefit:
              </span>
              <span className="font-bold text-green-600">€[Savings minus repayment]</span>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✔</span>
              <span className="text-gray-700">No early repayment penalties</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✔</span>
              <span className="text-gray-700">Preserve your cash, start saving immediately</span>
            </div>
          </div>
        </div>

        {/* View Your Full Report Section */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800">
                📄 View Your Full Report
              </h4>
              <p className="text-yellow-700 text-sm mt-1 mb-2">
                Your detailed report includes:
              </p>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Solar system estimate</li>
                <li>• Estimated savings & financial breakdown</li>
                <li>• How to apply for green finance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">👇</h3>
            <div className="space-y-2 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 w-full sm:w-auto">
                Download My Solar Report
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-2">💬 Want to Talk to Your Credit Union?</h3>
          <p className="text-gray-700 mb-3">You can book a call or speak directly:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="flex items-center space-x-2">
                <span>📞</span>
                <span>Phone: (091) 841 042</span>
              </p>
            </div>
            <div>
              <p className="flex items-center space-x-2">
                <span>📅</span>
                <a href="#" className="text-blue-600 hover:underline">Book a Call</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-4 text-xs text-gray-600">
        This email was sent on behalf of Synergy Credit Union, a regulated financial institution under
        the Central Bank of Ireland. All pricing estimates are based on property location, roof
        size, and energy usage patterns. Final loan terms are determined by your Credit Union.
        <p>
          📧 <a href="#" className="text-blue-600 hover:underline">Unsubscribe</a> | 
          <a 
            href="https://voltflo.com/PrivacyPolicy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

