import { Link } from 'react-router-dom';
import { Shield, TrendingUp, FileText, ArrowRight, CheckCircle, BarChart3, Lock, Zap, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-charcoal text-white">
      {/* Nav */}
      <nav className="border-b border-charcoal-lighter/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-mint rounded-app flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-charcoal" />
            </div>
            <span className="text-lg font-bold text-white">ReFi</span>
            <span className="text-lg font-light text-gray-400">Trading</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Sign in</Link>
            <Link to="/eligibility">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-24 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-mint/10 border border-mint/20 rounded-full px-4 py-1.5 mb-8">
            <Shield className="w-3.5 h-3.5 text-mint" />
            <span className="text-xs font-medium text-mint">Digital Investment Advisory</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Automated investing<br />
            <span className="text-mint">through your own broker.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            ReFi generates personalized investment recommendations from your goals, risk profile, and connected brokerage data. Start with recommendations only, or authorize managed execution inside the guardrails you approve.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/eligibility">
              <Button size="lg" className="gap-2">
                Start eligibility check <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">Sign in to your account</Button>
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            No minimum balance. Assets stay at your connected brokerage.
          </p>
        </div>
      </section>

      {/* Product tiers */}
      <section className="px-6 py-16 border-y border-charcoal-lighter/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Two ways to invest</h2>
            <p className="text-gray-400">Both modes generate advice through software. You choose the level of automation.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Signal */}
            <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-charcoal-light border border-charcoal-border rounded-app flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ReFi Signal</h3>
                  <p className="text-xs text-gray-500">Personalized recommendations</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-5">
                You receive software-generated portfolio recommendations with full rationale, profile fit analysis, and records. You decide whether to act manually through your brokerage.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Personalized to your goals, risk, and account',
                  'Full rationale for every recommendation',
                  'Complete advisory records',
                  'You act manually at your broker',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Managed */}
            <div className="bg-charcoal-lighter border border-mint/20 rounded-app-md p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-mint/10 text-mint text-xs font-semibold px-3 py-1 rounded-bl-app">
                Recommended
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-mint/10 border border-mint/20 rounded-app flex items-center justify-center">
                  <Zap className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ReFi Managed</h3>
                  <p className="text-xs text-gray-500">Automatic execution inside guardrails</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-5">
                ReFi submits eligible recommendations to your connected broker automatically after they pass your approved execution policy. Assets stay in your account.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Everything in Signal, plus automatic execution',
                  'User-approved execution policy and guardrails',
                  'Pause or resume anytime',
                  'Exception Review for out-of-policy items',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Lock, text: 'Assets stay at your brokerage' },
            { icon: BarChart3, text: 'Advice generated by software' },
            { icon: Shield, text: 'You approve profile and guardrails' },
            { icon: Activity, text: 'Pause managed execution anytime' },
            { icon: FileText, text: 'Every order has a record' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 bg-charcoal-lighter border border-charcoal-border rounded-app p-3">
              <Icon className="w-4 h-4 text-success shrink-0" />
              <span className="text-xs text-gray-400 leading-snug">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 border-t border-charcoal-lighter/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-gray-400">From profile to managed portfolio in three steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Build your advisory profile',
                desc: "Answer questions about your goals, time horizon, risk tolerance, and account type. Software uses this to generate your personalized strategy.",
              },
              {
                step: '02',
                title: 'Review your strategy and guardrails',
                desc: "See your recommended allocation, risk guardrails, and execution policy in plain English. Approve or adjust before anything runs.",
              },
              {
                step: '03',
                title: 'Choose your mode',
                desc: "Stay on ReFi Signal for recommendations only, or activate ReFi Managed to authorize automatic execution inside your approved guardrails.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-5xl font-bold text-charcoal-lighter mb-4 font-mono">{step}</div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User promise */}
      <section className="px-6 py-16 bg-charcoal-light/30 border-t border-charcoal-lighter/40">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">What we promise</h2>
              <ul className="space-y-4">
                {[
                  'Every recommendation is generated by software from your profile — no human staff give you personal advice outside this platform.',
                  'Your assets stay in your name at your connected brokerage. ReFi does not take custody.',
                  'You approve your strategy, execution policy, and guardrails before any automation runs.',
                  'Every recommendation, execution, and decision is permanently recorded.',
                  'You can pause managed execution at any time with one click.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-mint mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-4">Example: balanced growth allocation</div>
              <div className="space-y-3">
                {[
                  { label: 'US Equities (ETF)', pct: 55, color: 'bg-mint' },
                  { label: 'International (ETF)', pct: 20, color: 'bg-success' },
                  { label: 'Bonds (ETF)', pct: 20, color: 'bg-warning' },
                  { label: 'Cash', pct: 5, color: 'bg-gray-500' },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{label}</span>
                      <span className="font-mono text-white">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-charcoal-light rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">Your allocation is personalized to your profile, risk tolerance, and goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory trust */}
      <section className="px-6 py-14 border-t border-charcoal-lighter/40">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-mint" />
                <span className="text-sm font-semibold text-white">Regulated digital advisory</span>
              </div>
              <p className="text-xs text-gray-400 max-w-lg leading-relaxed">
                ReFi Trading operates under SEC Rule 203A-2(e) as a digital investment adviser providing advice exclusively through this operational interactive website. All recommendations are generated by software. ReFi staff do not provide client-specific advice outside the platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs text-gray-500 md:text-right">
              <a href="#" className="hover:text-gray-300 transition-colors">Form CRS</a>
              <a href="#" className="hover:text-gray-300 transition-colors">ADV Part 2A Brochure</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Advisory Agreement</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Risk Disclosure</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-charcoal-lighter/40 bg-charcoal-deep">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-mint rounded flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-charcoal" />
            </div>
            <span className="text-sm font-bold text-white">ReFi.Trading</span>
          </div>
          <p className="text-xs text-gray-600 text-center md:text-right max-w-lg">
            Investing involves risk, including the possible loss of principal. Past performance is not indicative of future results. This is not a bank account. Your brokerage account is not held by ReFi Trading.
          </p>
        </div>
      </footer>
    </div>
  );
}
