import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ChevronRight, ChevronLeft, CheckCircle, Target, DollarSign, Brain, ShieldCheck, Building2, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

const STEPS = ['Goals', 'Financial Profile', 'Experience', 'Risk Tolerance', 'Account Type', 'Disclosures'];

interface OnboardingData {
  goal: string;
  timeHorizon: string;
  targetAmount: string;
  employmentStatus: string;
  annualIncome: string;
  investableAssets: string;
  experience: string;
  riskReaction: string;
  riskPreference: string;
  accountType: string;
}

const initialData: OnboardingData = {
  goal: '',
  timeHorizon: '',
  targetAmount: '',
  employmentStatus: '',
  annualIncome: '',
  investableAssets: '',
  experience: '',
  riskReaction: '',
  riskPreference: '',
  accountType: '',
};

function StepGoals({ data, onChange }: { data: OnboardingData; onChange: (k: keyof OnboardingData, v: string) => void }) {
  const goals = [
    { id: 'long_term_growth', label: 'Long-term growth', desc: 'Build wealth over 10+ years' },
    { id: 'retirement', label: 'Retirement', desc: 'Prepare for financial independence' },
    { id: 'house_fund', label: 'House fund', desc: 'Save for a home purchase' },
    { id: 'general_investing', label: 'General investing', desc: 'Grow savings without a specific goal' },
    { id: 'income', label: 'Income generation', desc: 'Regular income from investments' },
  ];
  const horizons = ['1-3 years', '3-5 years', '5-10 years', '10+ years'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">What is your primary investment goal?</h3>
        <div className="grid grid-cols-1 gap-2">
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => onChange('goal', g.id)}
              className={`flex items-start gap-3 p-3 rounded-app border text-left transition-all ${
                data.goal === g.id
                  ? 'border-mint bg-mint/5 text-white'
                  : 'border-charcoal-border bg-charcoal-lighter/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                data.goal === g.id ? 'border-mint' : 'border-gray-600'
              }`}>
                {data.goal === g.id && <div className="w-2 h-2 bg-mint rounded-full" />}
              </div>
              <div>
                <p className="text-sm font-medium">{g.label}</p>
                <p className="text-xs text-gray-500">{g.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">What is your time horizon?</h3>
        <div className="grid grid-cols-2 gap-2">
          {horizons.map(h => (
            <button
              key={h}
              onClick={() => onChange('timeHorizon', h)}
              className={`p-3 rounded-app border text-sm text-center transition-all ${
                data.timeHorizon === h
                  ? 'border-mint bg-mint/5 text-white font-medium'
                  : 'border-charcoal-border bg-charcoal-lighter/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepFinancial({ data, onChange }: { data: OnboardingData; onChange: (k: keyof OnboardingData, v: string) => void }) {
  const SelectField = ({ label, value, field, options }: { label: string; value: string; field: keyof OnboardingData; options: string[] }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <select
        value={value}
        onChange={e => onChange(field, e.target.value)}
        className="bg-charcoal border border-gray-600 rounded-app-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:border-mint focus:ring-mint/30"
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <SelectField
        label="Employment status"
        value={data.employmentStatus}
        field="employmentStatus"
        options={['Employed full-time', 'Self-employed', 'Part-time / Contract', 'Retired', 'Student', 'Not currently employed']}
      />
      <SelectField
        label="Annual household income"
        value={data.annualIncome}
        field="annualIncome"
        options={['Under $50,000', '$50,000 – $100,000', '$100,000 – $200,000', '$200,000 – $500,000', 'Over $500,000']}
      />
      <SelectField
        label="Total investable assets (excluding primary home)"
        value={data.investableAssets}
        field="investableAssets"
        options={['Under $10,000', '$10,000 – $50,000', '$50,000 – $250,000', '$250,000 – $1,000,000', 'Over $1,000,000']}
      />
    </div>
  );
}

function StepExperience({ data, onChange }: { data: OnboardingData; onChange: (k: keyof OnboardingData, v: string) => void }) {
  const levels = [
    { id: 'first_time', label: 'First-time investor', desc: "I'm new to investing and learning the basics." },
    { id: 'some', label: 'Some experience', desc: "I've invested before and understand basic concepts." },
    { id: 'experienced', label: 'Experienced investor', desc: "I actively manage investments and understand markets." },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">What best describes your investment experience?</h3>
      {levels.map(l => (
        <button
          key={l.id}
          onClick={() => onChange('experience', l.id)}
          className={`w-full flex items-start gap-3 p-4 rounded-app border text-left transition-all ${
            data.experience === l.id
              ? 'border-mint bg-mint/5'
              : 'border-charcoal-border bg-charcoal-lighter/50 hover:border-gray-500'
          }`}
        >
          <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
            data.experience === l.id ? 'border-mint' : 'border-gray-600'
          }`}>
            {data.experience === l.id && <div className="w-2 h-2 bg-mint rounded-full" />}
          </div>
          <div>
            <p className={`text-sm font-medium ${data.experience === l.id ? 'text-white' : 'text-gray-300'}`}>{l.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{l.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function StepRisk({ data, onChange }: { data: OnboardingData; onChange: (k: keyof OnboardingData, v: string) => void }) {
  const reactions = [
    { id: 'sell', label: "I'd sell to prevent further losses", risk: 'conservative' },
    { id: 'hold', label: "I'd hold and wait for recovery", risk: 'moderate' },
    { id: 'buy', label: "I'd buy more at the lower price", risk: 'aggressive' },
  ];
  const preferences = [
    { id: 'stability', label: 'Stable returns with lower growth potential', risk: 'conservative' },
    { id: 'balanced', label: 'Balanced growth with moderate risk', risk: 'moderate' },
    { id: 'growth', label: 'Maximum growth, accepting higher risk', risk: 'aggressive' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-1">If your portfolio dropped 20% in a year, what would you do?</h3>
        <p className="text-xs text-gray-500 mb-3">This helps us understand your emotional response to market volatility.</p>
        <div className="space-y-2">
          {reactions.map(r => (
            <button
              key={r.id}
              onClick={() => onChange('riskReaction', r.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-app border text-left transition-all ${
                data.riskReaction === r.id
                  ? 'border-mint bg-mint/5 text-white'
                  : 'border-charcoal-border bg-charcoal-lighter/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                data.riskReaction === r.id ? 'border-mint' : 'border-gray-600'
              }`}>
                {data.riskReaction === r.id && <div className="w-2 h-2 bg-mint rounded-full" />}
              </div>
              <span className="text-sm">{r.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">What best describes your return preference?</h3>
        <div className="space-y-2">
          {preferences.map(p => (
            <button
              key={p.id}
              onClick={() => onChange('riskPreference', p.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-app border text-left transition-all ${
                data.riskPreference === p.id
                  ? 'border-mint bg-mint/5 text-white'
                  : 'border-charcoal-border bg-charcoal-lighter/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                data.riskPreference === p.id ? 'border-mint' : 'border-gray-600'
              }`}>
                {data.riskPreference === p.id && <div className="w-2 h-2 bg-mint rounded-full" />}
              </div>
              <span className="text-sm">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepAccount({ data, onChange }: { data: OnboardingData; onChange: (k: keyof OnboardingData, v: string) => void }) {
  const types = [
    { id: 'taxable', label: 'Individual taxable brokerage', desc: 'Standard investment account. No contribution limits.', icon: Building2 },
    { id: 'roth_ira', label: 'Roth IRA', desc: 'Tax-free growth. After-tax contributions. Income limits apply.', icon: ShieldCheck },
    { id: 'traditional_ira', label: 'Traditional IRA', desc: 'Tax-deferred growth. Contributions may be deductible.', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300 mb-1">What type of account are you opening?</h3>
      <p className="text-xs text-gray-500 mb-4">Your recommendation will be tailored to the tax characteristics of this account.</p>
      {types.map(t => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => onChange('accountType', t.id)}
            className={`w-full flex items-start gap-3 p-4 rounded-app border text-left transition-all ${
              data.accountType === t.id
                ? 'border-mint bg-mint/5'
                : 'border-charcoal-border bg-charcoal-lighter/50 hover:border-gray-500'
            }`}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${data.accountType === t.id ? 'text-mint' : 'text-gray-500'}`} />
            <div>
              <p className={`text-sm font-medium ${data.accountType === t.id ? 'text-white' : 'text-gray-300'}`}>{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface DisclosureConsents {
  formCRS: boolean;
  advPart2: boolean;
  advisoryAgreement: boolean;
  eDelivery: boolean;
  softwareAdvice: boolean;
}

function StepDisclosures({ consents, setConsents }: {
  consents: DisclosureConsents;
  setConsents: (c: DisclosureConsents) => void;
}) {
  const docs = [
    {
      id: 'formCRS' as keyof DisclosureConsents,
      title: 'Form CRS — Client Relationship Summary',
      desc: 'Describes the types of services we offer, fees and costs, conflicts of interest, and how to access more information.',
      required: true,
    },
    {
      id: 'advPart2' as keyof DisclosureConsents,
      title: 'ADV Part 2A — Firm Brochure',
      desc: 'Full description of our advisory services, investment strategies, risks, disciplinary history, and business practices.',
      required: true,
    },
    {
      id: 'advisoryAgreement' as keyof DisclosureConsents,
      title: 'Investment Advisory Agreement',
      desc: 'The legal agreement governing our advisory relationship, including our authority to recommend trades and your approval rights.',
      required: true,
    },
    {
      id: 'eDelivery' as keyof DisclosureConsents,
      title: 'E-Delivery Consent',
      desc: 'Consent to receive required documents electronically, including account statements, confirmations, and regulatory filings.',
      required: true,
    },
    {
      id: 'softwareAdvice' as keyof DisclosureConsents,
      title: 'Software-Generated Advice Disclosure',
      desc: 'Acknowledgement that recommendations are generated by software from your profile inputs, not a human adviser reviewing your specific situation.',
      required: true,
    },
  ];

  function toggle(id: keyof DisclosureConsents) {
    setConsents({ ...consents, [id]: !consents[id] });
  }

  const allChecked = Object.values(consents).every(Boolean);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Required disclosures & consents</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Before activating your advisory relationship, you must review and accept the following regulatory documents. Each one is required by SEC rules.
        </p>
      </div>

      <div className="space-y-3">
        {docs.map(doc => (
          <label key={doc.id} className={`flex items-start gap-3 p-4 rounded-app border cursor-pointer transition-all ${
            consents[doc.id]
              ? 'border-mint/40 bg-mint/5'
              : 'border-charcoal-border bg-charcoal-light/30 hover:border-gray-500'
          }`}>
            <input
              type="checkbox"
              checked={consents[doc.id]}
              onChange={() => toggle(doc.id)}
              className="mt-0.5 w-4 h-4 accent-mint shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <FileText className={`w-3.5 h-3.5 shrink-0 ${consents[doc.id] ? 'text-mint' : 'text-gray-500'}`} />
                <p className={`text-sm font-medium ${consents[doc.id] ? 'text-white' : 'text-gray-300'}`}>{doc.title}</p>
                <button
                  type="button"
                  className="text-gray-600 hover:text-mint transition-colors"
                  onClick={e => e.preventDefault()}
                  title="View document"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{doc.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {!allChecked && (
        <p className="text-xs text-gray-600 text-center">Please review and accept all documents to continue.</p>
      )}

      {allChecked && (
        <div className="bg-success/5 border border-success/20 rounded-app p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success shrink-0" />
          <p className="text-xs text-success">All disclosures accepted. Your consent will be logged with a timestamp.</p>
        </div>
      )}
    </div>
  );
}

function getRiskLevel(data: OnboardingData): string {
  const score = [
    data.riskReaction === 'buy' ? 2 : data.riskReaction === 'hold' ? 1 : 0,
    data.riskPreference === 'growth' ? 2 : data.riskPreference === 'balanced' ? 1 : 0,
    data.experience === 'experienced' ? 2 : data.experience === 'some' ? 1 : 0,
    data.timeHorizon === '10+ years' ? 2 : data.timeHorizon === '5-10 years' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  if (score >= 6) return 'aggressive';
  if (score >= 3) return 'moderate';
  return 'conservative';
}

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [consents, setConsents] = useState<DisclosureConsents>({
    formCRS: false,
    advPart2: false,
    advisoryAgreement: false,
    eDelivery: false,
    softwareAdvice: false,
  });
  const [saving, setSaving] = useState(false);

  function onChange(key: keyof OnboardingData, value: string) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  const allConsentsGiven = Object.values(consents).every(Boolean);

  function canProceed() {
    switch (step) {
      case 0: return data.goal && data.timeHorizon;
      case 1: return data.employmentStatus && data.annualIncome && data.investableAssets;
      case 2: return data.experience;
      case 3: return data.riskReaction && data.riskPreference;
      case 4: return data.accountType;
      case 5: return allConsentsGiven;
      default: return false;
    }
  }

  async function handleComplete() {
    if (!user) return;
    setSaving(true);
    const riskLevel = getRiskLevel(data);

    await supabase.from('investor_profiles').upsert({
      user_id: user.id,
      goal: data.goal,
      time_horizon: data.timeHorizon,
      risk_level: riskLevel,
      annual_income: data.annualIncome,
      investable_assets: data.investableAssets,
      investment_experience: data.experience,
      account_type: data.accountType,
    });

    // Seed initial recommendations
    await supabase.from('recommendations').insert([
      {
        user_id: user.id,
        title: 'Rebalance to your target allocation',
        summary: 'Your portfolio has drifted from your target mix. We recommend rebalancing to bring it back in line.',
        reason: `Based on your ${data.timeHorizon} time horizon and ${riskLevel} risk tolerance, staying close to your target allocation improves your probability of reaching your goal.`,
        profile_fit: `Goal: ${data.goal.replace(/_/g, ' ')} | Risk: ${riskLevel} | Horizon: ${data.timeHorizon}`,
        estimated_impact: 'Returns your portfolio to target allocation within 0.5%',
        status: 'pending',
      },
      {
        user_id: user.id,
        title: 'Invest your available cash',
        summary: 'You have uninvested cash sitting in your account. Deploying it according to your strategy could improve long-term returns.',
        reason: 'Cash drag reduces long-term compounding. Investing available cash aligns with your growth objective.',
        profile_fit: `Goal: ${data.goal.replace(/_/g, ' ')} | Account: ${data.accountType}`,
        estimated_impact: 'Estimated 0.3% improvement in expected annual return',
        status: 'pending',
      },
    ]);

    // Seed activity events
    await supabase.from('activity_events').insert([
      {
        user_id: user.id,
        event_type: 'profile_created',
        title: 'Investor profile completed',
        description: `Your suitability profile has been set up. Risk level: ${riskLevel}. Time horizon: ${data.timeHorizon}.`,
        status: 'completed',
      },
      {
        user_id: user.id,
        event_type: 'disclosure_accepted',
        title: 'Required disclosures accepted',
        description: 'Form CRS, ADV Part 2A, Advisory Agreement, E-Delivery Consent, and Software Advice Disclosure acknowledged and logged.',
        status: 'completed',
      },
      {
        user_id: user.id,
        event_type: 'recommendation_created',
        title: 'First recommendations generated',
        description: '2 portfolio recommendations have been created based on your profile.',
        status: 'completed',
      },
    ]);

    await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id);

    await refreshProfile();
    setSaving(false);
    navigate('/app');
  }

  const stepIcons = [Target, DollarSign, Brain, ShieldCheck, Building2, FileText];

  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 bg-mint rounded-app flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-charcoal" />
          </div>
          <span className="text-lg font-bold text-white">ReFi</span>
          <span className="text-lg font-light text-gray-400">Trading</span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {STEPS.map((s, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    i < step ? 'bg-mint text-charcoal' : i === step ? 'bg-mint/20 border border-mint text-mint' : 'bg-charcoal-lighter border border-charcoal-border text-gray-600'
                  }`}>
                    {i < step ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px flex-1 transition-all ${i < step ? 'bg-mint' : 'bg-charcoal-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Step {step + 1} of {STEPS.length}</span>
            <span className="text-xs font-medium text-mint">{STEPS[step]}</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6 mb-6">
          {step === 0 && <StepGoals data={data} onChange={onChange} />}
          {step === 1 && <StepFinancial data={data} onChange={onChange} />}
          {step === 2 && <StepExperience data={data} onChange={onChange} />}
          {step === 3 && <StepRisk data={data} onChange={onChange} />}
          {step === 4 && <StepAccount data={data} onChange={onChange} />}
          {step === 5 && <StepDisclosures consents={consents} setConsents={setConsents} />}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="tertiary"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="gap-1">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!canProceed()} loading={saving} className="gap-1">
              Activate account <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
