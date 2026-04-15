import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E63946]">
        <div className="flex items-center gap-1">
          <span className="text-[#E63946] font-extrabold text-xl tracking-wide">Ref</span>
          <span className="text-white font-extrabold text-xl">Calc</span>
        </div>
        <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition-colors">
          Admin
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center bg-gradient-to-b from-[#16354B] to-[#1e4a6a]">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
          <span className="text-[#E63946]">Ref</span>Calc
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mb-2">
          Refrigerant Gas Detection Calculator
        </p>
        <p className="text-sm sm:text-base text-gray-400 max-w-xl mb-10">
          Calculate detection requirements per EN 378, ASHRAE 15, and ISO 5149
        </p>
        <Link
          href="/configurator"
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#d32f3c] text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
        >
          Start Calculator
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#16354B] text-center mb-12">
            Professional Gas Detection Sizing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#16354B] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#16354B] mb-2">Multi-Regulation</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Full support for EN 378, ASHRAE 15, and ISO 5149 with automatic compliance checks and limit calculations.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#E63946] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#16354B] mb-2">36 Refrigerants</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Complete database of refrigerant gases with safety groups, molecular weights, LEL/OEL values, and charge limits.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#A7C031] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#16354B] mb-2">24 Applications</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Pre-configured application types from supermarkets to cold rooms, with automatic regulatory context detection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#16354B] text-gray-400 text-center py-6 text-sm">
        Powered by <span className="text-white font-semibold">SAMON AB</span> — Gas Detection Systems
      </footer>
    </div>
  );
}
