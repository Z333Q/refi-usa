import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle, AlertCircle, Clock, ChevronRight, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

const PAPER_BETA_STATES = [
  'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Washington',
  'Massachusetts', 'Colorado', 'Georgia', 'Arizona', 'Oregon', 'Nevada',
  'North Carolina', 'Virginia', 'Minnesota', 'Michigan', 'Ohio',
];

const WAITLIST_STATES = [
  'Alabama', 'Alaska', 'Arkansas', 'Connecticut', 'Delaware', 'Hawaii',
  'Idaho', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Maryland', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'New Hampshire',
  'New Jersey', 'New Mexico', 'North Dakota', 'Oklahoma', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Utah',
  'Vermont', 'West Virginia', 'Wisconsin', 'Wyoming',
];

type EligibilityResult = 'paper_beta' | 'live_beta' | 'waitlist' | null;

function getResult(state: string): EligibilityResult {
  if (!state) return null;
  if (PAPER_BETA_STATES.includes(state)) return 'paper_beta';
  if (WAITLIST_STATES.includes(state)) return 'waitlist';
  return null;
}

export default function Eligibility() {
  const navigate = useNavigate();
  const [state, setState] = useState('');
  const [age, setAge] = useState(false);
  const [usPerson, setUsPerson] = useState(false);
  const [personalUse, setPersonalUse] = useState(false);
  const [checked, setChecked] = useState(false);

  const allChecked = state && age && usPerson && personalUse;
  const result = checked ? getResult(state) : null;

  function handleCheck() {
    if (!allChecked) return;
    setChecked(true);
  }

  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 bg-mint rounded-app flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-charcoal" />
          </div>
          <span className="text-xl font-bold text-white">ReFi</span>
          <span className="text-xl font-light text-gray-400">Trading</span>
        </div>

        {!result ? (
          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-8">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-mint" />
              <span className="text-xs font-semibold text-mint uppercase tracking-wide">Eligibility check</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Let's confirm you're eligible</h1>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              ReFi Trading is a registered investment adviser operating under SEC Rule 203A-2(e). We need to confirm a few things before you proceed.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">State of residence</label>
                <select
                  value={state}
                  onChange={e => { setState(e.target.value); setChecked(false); }}
                  className="w-full bg-charcoal border border-gray-600 rounded-app-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:border-mint focus:ring-mint/30"
                >
                  <option value="">Select your state</option>
                  {[...PAPER_BETA_STATES, ...WAITLIST_STATES].sort().map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'age', checked: age, set: setAge, label: 'I am 18 years of age or older.' },
                  { id: 'us', checked: usPerson, set: setUsPerson, label: 'I am a U.S. person (citizen, resident alien, or U.S. tax resident).' },
                  { id: 'personal', checked: personalUse, set: setPersonalUse, label: 'I am opening this account for personal, family, or household investing purposes — not for a business or institution.' },
                ].map(item => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={e => { item.set(e.target.checked); setChecked(false); }}
                      className="mt-0.5 w-4 h-4 accent-mint shrink-0"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">{item.label}</span>
                  </label>
                ))}
              </div>

              <Button
                onClick={handleCheck}
                disabled={!allChecked}
                className="w-full mt-2"
              >
                Check eligibility
              </Button>
            </div>

            <p className="text-xs text-gray-600 text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-mint hover:text-mint-light transition-colors">Sign in</Link>
            </p>
          </div>
        ) : result === 'paper_beta' ? (
          <EligibleResult state={state} onContinue={() => navigate('/register')} />
        ) : (
          <WaitlistResult state={state} onBack={() => setChecked(false)} />
        )}
      </div>
    </div>
  );
}

function EligibleResult({ state, onContinue }: { state: string; onContinue: () => void }) {
  return (
    <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
      <div className="bg-success/5 border-b border-success/20 px-8 py-6 text-center">
        <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">You're eligible</h2>
        <p className="text-sm text-gray-400">
          <span className="font-medium text-white">{state}</span> is in our paper beta program.
        </p>
      </div>

      <div className="px-8 py-6 space-y-4">
        <div className="bg-charcoal-light border border-charcoal-border rounded-app p-4">
          <p className="text-xs font-semibold text-mint uppercase tracking-wide mb-2">Paper beta access</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            You'll have full access to all features in simulation mode. Portfolio recommendations are generated from your real investor profile, but no actual trades are placed. This is your chance to see exactly how ReFi Trading would manage your money.
          </p>
        </div>

        <div className="space-y-2">
          {[
            'Personalized portfolio recommendations from your risk profile',
            'Simulated trade approvals and execution records',
            'Full disclosure documents and compliance records',
            'Live investing available once we confirm state advisory registration',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
              <span className="text-xs text-gray-400">{item}</span>
            </div>
          ))}
        </div>

        <div className="bg-warning/5 border border-warning/20 rounded-app p-3">
          <p className="text-xs text-warning font-medium mb-1">Important disclosure</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            ReFi Trading acts as your registered investment adviser. Recommendations are software-generated based on your profile inputs and are not individually tailored advice from a human adviser. Past performance does not guarantee future results.{' '}
            <Link to="/app/documents" className="text-mint hover:text-mint-light">Read disclosures</Link>
          </p>
        </div>

        <Button onClick={onContinue} className="w-full gap-2">
          Start paper beta <ChevronRight className="w-4 h-4" />
        </Button>

        <p className="text-xs text-gray-600 text-center">
          By continuing you agree to receive e-delivery of all required account documents.
        </p>
      </div>
    </div>
  );
}

function WaitlistResult({ state, onBack }: { state: string; onBack: () => void }) {
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
      <div className="bg-warning/5 border-b border-warning/20 px-8 py-6 text-center">
        <Clock className="w-10 h-10 text-warning mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Not available yet in {state}</h2>
        <p className="text-sm text-gray-400">
          We're working to expand to all 50 states. Join the waitlist and we'll notify you when we launch.
        </p>
      </div>

      <div className="px-8 py-6 space-y-4">
        {!joined ? (
          <>
            <div className="bg-charcoal-light border border-charcoal-border rounded-app p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-white mb-1">Why state availability matters</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    As a registered investment adviser, ReFi Trading must comply with state notice filing requirements before offering advisory services to residents of each state. We're actively completing registrations.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-charcoal border border-gray-600 rounded-app-sm px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-mint focus:ring-mint/30"
              />
            </div>

            <Button
              onClick={() => email.includes('@') && setJoined(true)}
              disabled={!email.includes('@')}
              variant="secondary"
              className="w-full"
            >
              Join waitlist for {state}
            </Button>

            <button
              onClick={onBack}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors w-full text-center"
            >
              Back to eligibility check
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
            <p className="text-sm font-medium text-white mb-1">You're on the list</p>
            <p className="text-xs text-gray-400 mb-4">We'll email {email} as soon as ReFi Trading is available in {state}.</p>
            <Link to="/" className="text-sm text-mint hover:text-mint-light transition-colors">
              Return to homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
