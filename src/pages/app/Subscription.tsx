import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, Zap, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const SIGNAL_FEATURES = [
  'Personalized software-generated recommendations',
  'Full rationale, profile fit, and risk analysis',
  'Complete recommendation history and records',
  'Disclosure documents and compliance records',
  'Advisory profile management',
  'Broker sync for portfolio context',
];

const MANAGED_FEATURES = [
  'Everything in ReFi Signal',
  'Automatic broker submission for eligible recommendations',
  'User-approved execution policy and guardrails',
  'Automation Center with pause and resume controls',
  'Exception Review for out-of-policy recommendations',
  'Full execution records: eligibility checks, broker orders, fills',
];

export default function Subscription() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selecting, setSelecting] = useState<'signal' | 'managed' | null>(null);

  async function handleSelect(tier: 'signal' | 'managed') {
    if (!user) return;
    setSelecting(tier);
    await supabase.from('profiles').update({ subscription_tier: tier }).eq('id', user.id);
    await supabase.from('activity_events').insert({
      user_id: user.id,
      event_type: 'subscription_selected',
      title: `${tier === 'signal' ? 'ReFi Signal' : 'ReFi Managed'} selected`,
      description: `Subscription tier set to ${tier === 'signal' ? 'ReFi Signal (recommendations only)' : 'ReFi Managed (automatic execution)'}`,
      status: 'completed',
    });
    await refreshProfile();
    setSelecting(null);
    if (tier === 'managed') {
      navigate('/app/managed-activation');
    } else {
      navigate('/app');
    }
  }

  const currentTier = profile?.subscription_tier || 'signal';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white mb-1">Choose your plan</h1>
        <p className="text-sm text-gray-500">Both plans generate personalized advice through software. ReFi Managed adds automatic broker execution inside the guardrails you approve.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Signal */}
        <div className={`bg-charcoal-lighter border rounded-app-md overflow-hidden flex flex-col ${
          currentTier === 'signal' ? 'border-mint/40' : 'border-charcoal-border'
        }`}>
          <div className="p-6 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-charcoal-light border border-charcoal-border rounded-app flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-mint" />
              </div>
              <span className="text-lg font-bold text-white">ReFi Signal</span>
              {currentTier === 'signal' && <Badge variant="mint">Current plan</Badge>}
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Personalized recommendations. You review and act manually.
            </p>
            <div className="mb-6">
              <span className="text-2xl font-bold text-white">$9</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <ul className="space-y-2.5">
              {SIGNAL_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-300">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-6 pb-6">
            <Button
              onClick={() => handleSelect('signal')}
              loading={selecting === 'signal'}
              disabled={selecting !== null}
              variant={currentTier === 'signal' ? 'secondary' : 'secondary'}
              className="w-full"
            >
              {currentTier === 'signal' ? 'Current plan' : 'Switch to Signal'}
            </Button>
          </div>
        </div>

        {/* Managed */}
        <div className={`bg-charcoal-lighter border rounded-app-md overflow-hidden flex flex-col ${
          currentTier === 'managed' ? 'border-mint/40' : 'border-mint/20'
        }`}>
          <div className="bg-mint/5 border-b border-mint/20 px-6 py-2 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-mint" />
            <span className="text-xs font-semibold text-mint uppercase tracking-wide">Recommended</span>
          </div>
          <div className="p-6 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-mint/10 border border-mint/20 rounded-app flex items-center justify-center">
                <Shield className="w-4 h-4 text-mint" />
              </div>
              <span className="text-lg font-bold text-white">ReFi Managed</span>
              {currentTier === 'managed' && <Badge variant="mint">Current plan</Badge>}
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Automatic execution inside guardrails you approve. Assets stay at your broker.
            </p>
            <div className="mb-6">
              <span className="text-2xl font-bold text-white">$24</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <ul className="space-y-2.5">
              {MANAGED_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${f.startsWith('Everything') ? 'text-gray-500' : 'text-mint'}`} />
                  <span className={`text-xs ${f.startsWith('Everything') ? 'text-gray-500' : 'text-gray-300'}`}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-6 pb-6">
            <Button
              onClick={() => handleSelect('managed')}
              loading={selecting === 'managed'}
              disabled={selecting !== null}
              className="w-full gap-1.5"
            >
              {currentTier === 'managed' ? 'Manage settings' : 'Activate ReFi Managed'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Trust grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Assets stay at your broker', icon: Shield },
          { label: 'Advice generated by software', icon: TrendingUp },
          { label: 'You approve guardrails', icon: CheckCircle },
          { label: 'Complete records kept', icon: CheckCircle },
        ].map(({ label, icon: Icon }) => (
          <div key={label} className="bg-charcoal-lighter border border-charcoal-border rounded-app p-3 flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-success shrink-0" />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-400">About ReFi Managed:</span> By activating managed execution you authorize ReFi Trading software to submit eligible portfolio recommendations to your connected broker inside your approved execution policy. All assets remain in your brokerage account. You can pause or cancel managed execution at any time. ReFi staff do not create, modify, or approve individual trades outside the platform.
        </p>
      </div>
    </div>
  );
}
