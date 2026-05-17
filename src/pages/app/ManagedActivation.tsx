import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, CheckCircle, ChevronRight, AlertCircle, Zap,
  TrendingUp, Target, DollarSign, Activity, Pause
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface ExecutionPolicy {
  strategy_name: string;
  max_order_value: number;
  max_position_pct: number;
  daily_order_limit: number;
  min_cash_reserve: number;
  restricted_sectors: string[];
  daily_loss_pause_pct: number;
  drawdown_pause_pct: number;
  market_orders_allowed: boolean;
  limit_orders_required: boolean;
}

const DEFAULT_POLICY: ExecutionPolicy = {
  strategy_name: 'Balanced Growth',
  max_order_value: 2000,
  max_position_pct: 8,
  daily_order_limit: 4,
  min_cash_reserve: 2500,
  restricted_sectors: [],
  daily_loss_pause_pct: 2,
  drawdown_pause_pct: 8,
  market_orders_allowed: false,
  limit_orders_required: true,
};

const REQUIRED_ACKNOWLEDGMENTS = [
  'I understand that ReFi Trading uses software-based models to generate recommendations.',
  'I understand that eligible recommendations may be submitted automatically to my connected broker inside my approved execution policy.',
  'I understand that my assets remain in my brokerage account and ReFi does not take custody.',
  'I understand that I can pause managed execution at any time from the Automation Center.',
  'I understand that ReFi support does not provide personalized investment advice outside the platform.',
  'I understand that all recommendations and broker submissions are permanently recorded.',
  'I understand that changing my profile, strategy, or guardrails may pause automatic execution.',
];

const NOT_PERMITTED = [
  'Take custody of your assets',
  'Move money out of your brokerage account',
  'Let staff choose trades on your behalf',
  'Trade outside your approved strategy',
  'Trade outside your approved guardrails',
  'Execute when required disclosures are outdated',
  'Execute when your account is paused',
];

export default function ManagedActivation() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [policy] = useState<ExecutionPolicy>(DEFAULT_POLICY);
  const [acks, setAcks] = useState<boolean[]>(Array(REQUIRED_ACKNOWLEDGMENTS.length).fill(false));
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (profile?.managed_active) setActivated(true);
  }, [profile]);

  const allAcked = acks.every(Boolean);

  function toggleAck(i: number) {
    setAcks(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  async function handleActivate() {
    if (!user || !allAcked) return;
    setActivating(true);

    await supabase.from('execution_policies').insert({
      user_id: user.id,
      version: 1,
      mode: 'managed',
      strategy_name: policy.strategy_name,
      max_order_value: policy.max_order_value,
      max_position_pct: policy.max_position_pct,
      daily_order_limit: policy.daily_order_limit,
      min_cash_reserve: policy.min_cash_reserve,
      restricted_sectors: policy.restricted_sectors,
      daily_loss_pause_pct: policy.daily_loss_pause_pct,
      drawdown_pause_pct: policy.drawdown_pause_pct,
      market_orders_allowed: policy.market_orders_allowed,
      limit_orders_required: policy.limit_orders_required,
      status: 'active',
      user_approved_at: new Date().toISOString(),
      effective_at: new Date().toISOString(),
    });

    await supabase.from('profiles').update({
      subscription_tier: 'managed',
      managed_active: true,
      management_mode: 'auto',
    }).eq('id', user.id);

    await supabase.from('activity_events').insert({
      user_id: user.id,
      event_type: 'managed_activated',
      title: 'ReFi Managed activated',
      description: `Managed execution activated. Execution Policy v1 approved. Strategy: ${policy.strategy_name}. Max order: $${policy.max_order_value}. Guardrails confirmed.`,
      status: 'completed',
    });

    await refreshProfile();
    setActivating(false);
    setActivated(true);
  }

  if (activated) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-success/5 border border-success/20 rounded-app-md p-8 text-center">
          <div className="w-14 h-14 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-success" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">ReFi Managed is active</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Your execution policy has been approved and logged. ReFi will now generate recommendations and submit eligible ones to your connected broker inside your approved guardrails.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            {[
              { label: 'Mode', value: 'ReFi Managed' },
              { label: 'Strategy', value: policy.strategy_name },
              { label: 'Max order', value: `$${policy.max_order_value.toLocaleString()}` },
              { label: 'Cash reserve', value: `$${policy.min_cash_reserve.toLocaleString()}` },
            ].map(item => (
              <div key={item.label} className="bg-charcoal-lighter border border-charcoal-border rounded-app p-3">
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => navigate('/app/automation')} className="gap-2">
              <Activity className="w-4 h-4" /> Open Automation Center
            </Button>
            <Button variant="secondary" onClick={() => navigate('/app')} className="gap-1">
              Go to Home <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-mint" />
          <h1 className="text-xl font-bold text-white">Activate ReFi Managed</h1>
        </div>
        <p className="text-sm text-gray-500">Authorize automatic broker execution inside the guardrails you approve. Your assets stay at your brokerage.</p>
      </div>

      {/* What you're turning on */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-mint" />
          <h2 className="text-sm font-semibold text-white">What you are turning on</h2>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          ReFi Trading software will generate personalized portfolio recommendations from your advisory profile. When a recommendation passes your approved execution policy, ReFi will submit it to your connected broker automatically — without requiring a click on each individual trade.
        </p>
      </div>

      {/* Execution Policy Summary */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-mint" />
            <h2 className="text-sm font-semibold text-white">Your execution policy</h2>
          </div>
          <Badge variant="mint">v1</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Strategy', value: policy.strategy_name },
            { label: 'Max single order', value: `$${policy.max_order_value.toLocaleString()}` },
            { label: 'Max position size', value: `${policy.max_position_pct}%` },
            { label: 'Daily order limit', value: `${policy.daily_order_limit} orders` },
            { label: 'Cash reserve', value: `$${policy.min_cash_reserve.toLocaleString()}` },
            { label: 'Daily loss pause', value: `${policy.daily_loss_pause_pct}%` },
            { label: 'Drawdown pause', value: `${policy.drawdown_pause_pct}%` },
            { label: 'Market orders', value: policy.market_orders_allowed ? 'Allowed' : 'Disabled' },
          ].map(item => (
            <div key={item.label} className="bg-charcoal-light rounded-app p-2.5">
              <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
              <p className="text-xs font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">You can edit these settings anytime from the Automation Center.</p>
      </div>

      {/* What ReFi will NOT do */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">What ReFi will not do</h2>
        </div>
        <div className="space-y-2">
          {NOT_PERMITTED.map(item => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border border-error/40 rounded-sm flex items-center justify-center shrink-0">
                <div className="w-1.5 h-0.5 bg-error rounded-full" />
              </div>
              <span className="text-xs text-gray-400">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pause control note */}
      <div className="bg-warning/5 border border-warning/20 rounded-app-md p-4 mb-5 flex items-start gap-3">
        <Pause className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-warning mb-0.5">You can pause at any time</p>
          <p className="text-xs text-gray-400 leading-relaxed">Pausing stops new broker submissions immediately. It does not cancel orders already sent to your broker. You can resume, edit your policy, or switch back to ReFi Signal at any time.</p>
        </div>
      </div>

      {/* Required acknowledgments */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-mint" />
          <h2 className="text-sm font-semibold text-white">Required acknowledgments</h2>
          <span className="text-xs text-gray-600 ml-auto">{acks.filter(Boolean).length}/{acks.length} confirmed</span>
        </div>
        <div className="space-y-3">
          {REQUIRED_ACKNOWLEDGMENTS.map((text, i) => (
            <label key={i} className={`flex items-start gap-3 p-3 rounded-app border cursor-pointer transition-all ${
              acks[i] ? 'border-mint/30 bg-mint/5' : 'border-charcoal-border hover:border-gray-600'
            }`}>
              <input
                type="checkbox"
                checked={acks[i]}
                onChange={() => toggleAck(i)}
                className="mt-0.5 w-4 h-4 accent-mint shrink-0"
              />
              <span className={`text-xs leading-relaxed ${acks[i] ? 'text-gray-300' : 'text-gray-400'}`}>{text}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleActivate}
          loading={activating}
          disabled={!allAcked}
          className="gap-2"
        >
          <Zap className="w-4 h-4" /> Activate ReFi Managed
        </Button>
        <Button variant="secondary" onClick={() => navigate('/app/subscription')} disabled={activating}>
          Stay on Signal
        </Button>
      </div>

      {!allAcked && (
        <p className="text-xs text-gray-600 mt-3">Please confirm all acknowledgments above to continue.</p>
      )}

      <div className="mt-5 bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-400">Investment advisory disclosure:</span> Activating ReFi Managed does not change how investment advice is generated. All recommendations are produced by ReFi Trading software based on your investor profile. Managed execution simply authorizes ReFi software to submit eligible recommendations to your connected broker inside this approved policy. See your <span className="text-mint cursor-pointer" onClick={() => navigate('/app/documents')}>disclosure documents</span> for full details.
        </p>
      </div>
    </div>
  );
}
