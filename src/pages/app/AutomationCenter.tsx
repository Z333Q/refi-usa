import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Shield, Pause, Play, AlertCircle, CheckCircle, ChevronRight,
  Activity, Settings, Clock, TrendingUp, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface ExecutionPolicy {
  id: string;
  version: number;
  mode: string;
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
  status: string;
  user_approved_at: string;
  effective_at: string;
}

interface BrokerSubmission {
  id: string;
  asset: string;
  amount: number;
  submitted_at: string;
  fill_status: string;
  broker_order_id: string;
  recommendation_id: string;
}

type AutomationStatus = 'active' | 'paused_user' | 'paused_guardrail' | 'paused_broker' | 'review_required' | 'not_configured';

function statusConfig(s: AutomationStatus) {
  const map: Record<AutomationStatus, { label: string; color: string; badge: 'success' | 'warning' | 'error' | 'neutral' }> = {
    active: { label: 'Active', color: 'text-success', badge: 'success' },
    paused_user: { label: 'Paused by you', color: 'text-warning', badge: 'warning' },
    paused_guardrail: { label: 'Paused by guardrail', color: 'text-warning', badge: 'warning' },
    paused_broker: { label: 'Paused — broker issue', color: 'text-error', badge: 'error' },
    review_required: { label: 'Review required', color: 'text-warning', badge: 'warning' },
    not_configured: { label: 'Not configured', color: 'text-gray-400', badge: 'neutral' },
  };
  return map[s];
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AutomationCenter() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<ExecutionPolicy | null>(null);
  const [submissions, setSubmissions] = useState<BrokerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [pausing, setPausing] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: pol }, { data: subs }] = await Promise.all([
        supabase.from('execution_policies').select('*').eq('user_id', user.id).eq('status', 'active').order('version', { ascending: false }).limit(1),
        supabase.from('broker_submissions').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(10),
      ]);
      setPolicy(pol?.[0] || null);
      setSubmissions(subs || []);
      setLoading(false);
    })();
  }, [user]);

  async function handlePause() {
    if (!user || !policy) return;
    setPausing(true);
    await supabase.from('execution_policies').update({ status: 'paused' }).eq('id', policy.id);
    await supabase.from('profiles').update({ managed_active: false, managed_paused_reason: 'user_paused' }).eq('id', user.id);
    await supabase.from('activity_events').insert({
      user_id: user.id,
      event_type: 'managed_paused',
      title: 'Managed execution paused',
      description: 'You paused managed execution. No new orders will be submitted until you resume.',
      status: 'completed',
    });
    await refreshProfile();
    setPolicy(prev => prev ? { ...prev, status: 'paused' } : prev);
    setPausing(false);
  }

  async function handleResume() {
    if (!user || !policy) return;
    setPausing(true);
    await supabase.from('execution_policies').update({ status: 'active' }).eq('id', policy.id);
    await supabase.from('profiles').update({ managed_active: true, managed_paused_reason: '' }).eq('id', user.id);
    await supabase.from('activity_events').insert({
      user_id: user.id,
      event_type: 'managed_resumed',
      title: 'Managed execution resumed',
      description: 'Managed execution has been resumed. Eligible recommendations will be submitted to your broker automatically.',
      status: 'completed',
    });
    await refreshProfile();
    setPolicy(prev => prev ? { ...prev, status: 'active' } : prev);
    setPausing(false);
  }

  const managedActive = profile?.managed_active;
  const policyActive = policy?.status === 'active';
  const automationStatus: AutomationStatus = !policy
    ? 'not_configured'
    : !managedActive || !policyActive
    ? 'paused_user'
    : 'active';

  const statusInfo = statusConfig(automationStatus);

  if (!profile?.subscription_tier || profile.subscription_tier !== 'managed') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-12 text-center">
          <Zap className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-2">Automation Center requires ReFi Managed</p>
          <p className="text-xs text-gray-500 mb-5">Upgrade to ReFi Managed to enable automatic broker execution inside approved guardrails.</p>
          <Button onClick={() => navigate('/app/subscription')} className="gap-2">
            <Zap className="w-4 h-4" /> Upgrade to ReFi Managed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-mint" />
          <h1 className="text-xl font-bold text-white">Automation Center</h1>
        </div>
        <p className="text-sm text-gray-500">Control what ReFi is authorized to do automatically inside your approved execution policy.</p>
      </div>

      {/* Status card */}
      <div className={`bg-charcoal-lighter border rounded-app-md p-5 mb-6 ${
        automationStatus === 'active' ? 'border-success/30' :
        automationStatus === 'paused_user' ? 'border-warning/30' : 'border-charcoal-border'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${automationStatus === 'active' ? 'bg-success animate-pulse' : 'bg-warning'}`} />
              <p className="text-sm font-semibold text-white">Managed Execution</p>
              <Badge variant={statusInfo.badge}>{statusInfo.label}</Badge>
            </div>
            <p className="text-xs text-gray-500">
              {automationStatus === 'active'
                ? `Eligible recommendations will be submitted automatically to your connected ${profile?.brokerage_name || 'broker'}.`
                : automationStatus === 'paused_user'
                ? 'Managed execution is paused. No new orders will be submitted.'
                : 'Configure your execution policy to enable managed execution.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {automationStatus === 'active' ? (
              <Button variant="secondary" onClick={handlePause} loading={pausing} className="gap-2">
                <Pause className="w-3.5 h-3.5" /> Pause
              </Button>
            ) : automationStatus === 'paused_user' ? (
              <Button onClick={handleResume} loading={pausing} className="gap-2">
                <Play className="w-3.5 h-3.5" /> Resume
              </Button>
            ) : (
              <Button onClick={() => navigate('/app/managed-activation')} className="gap-2">
                <Zap className="w-3.5 h-3.5" /> Activate
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Execution Policy */}
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-border">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-mint" />
              <h2 className="text-sm font-semibold text-white">Active execution policy</h2>
            </div>
            {policy && <Badge variant="neutral">v{policy.version}</Badge>}
          </div>
          {loading ? (
            <div className="p-5 space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-8 bg-charcoal-light rounded-app animate-pulse" />)}
            </div>
          ) : policy ? (
            <div className="p-4">
              <div className="space-y-1.5">
                {[
                  { label: 'Strategy', value: policy.strategy_name },
                  { label: 'Max order', value: `$${policy.max_order_value.toLocaleString()}` },
                  { label: 'Max position', value: `${policy.max_position_pct}%` },
                  { label: 'Daily orders', value: `${policy.daily_order_limit} max` },
                  { label: 'Cash reserve', value: `$${policy.min_cash_reserve.toLocaleString()}` },
                  { label: 'Daily loss pause', value: `${policy.daily_loss_pause_pct}%` },
                  { label: 'Drawdown pause', value: `${policy.drawdown_pause_pct}%` },
                  { label: 'Market orders', value: policy.market_orders_allowed ? 'Enabled' : 'Disabled' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1 border-b border-charcoal-border last:border-0">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Approved {formatDateTime(policy.user_approved_at)}
              </p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Settings className="w-7 h-7 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No policy configured yet.</p>
              <button onClick={() => navigate('/app/managed-activation')} className="text-xs text-mint hover:text-mint-light transition-colors mt-2">
                Activate ReFi Managed
              </button>
            </div>
          )}
        </div>

        {/* Recent automatic activity */}
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-border">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-mint" />
              <h2 className="text-sm font-semibold text-white">Automatic activity</h2>
            </div>
            <button onClick={() => navigate('/app/records')} className="text-xs text-mint hover:text-mint-light flex items-center gap-1">
              All records <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Demo submission entries */}
          <div className="divide-y divide-charcoal-border">
            {submissions.length > 0 ? submissions.slice(0, 4).map(sub => (
              <div key={sub.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{sub.asset || 'Portfolio rebalance'}</p>
                    <p className="text-xs text-gray-600">{formatDateTime(sub.submitted_at)}</p>
                  </div>
                  <Badge variant={sub.fill_status === 'filled' ? 'success' : sub.fill_status === 'pending' ? 'warning' : 'neutral'}>
                    {sub.fill_status}
                  </Badge>
                </div>
              </div>
            )) : (
              /* Demo fixture entries */
              [
                { action: 'Invested $1,250 — broad-market ETF', time: 'Today, 9:45 AM', status: 'filled' },
                { action: 'Added $800 — bond allocation rebalance', time: 'Yesterday, 2:12 PM', status: 'filled' },
                { action: 'Recommendation paused — tax review', time: 'Yesterday, 9:30 AM', status: 'review' },
              ].map((item, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{item.action}</p>
                      <p className="text-xs text-gray-600">{item.time}</p>
                    </div>
                    <Badge variant={item.status === 'filled' ? 'success' : 'warning'}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pause controls & quick actions */}
      <div className="mt-6 bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
        <div className="px-5 py-4 border-b border-charcoal-border">
          <h2 className="text-sm font-semibold text-white">Controls</h2>
        </div>
        <div className="divide-y divide-charcoal-border">
          {[
            { icon: AlertCircle, label: 'Review exceptions', desc: 'Recommendations that need your approval before execution', action: () => navigate('/app/exceptions'), badge: null },
            { icon: TrendingUp, label: 'View recommendations', desc: 'All generated recommendations and their status', action: () => navigate('/app/recommendations'), badge: null },
            { icon: RefreshCw, label: 'Edit execution policy', desc: 'Change guardrails, order limits, or pause conditions', action: () => navigate('/app/managed-activation'), badge: null },
            { icon: Shield, label: 'Records', desc: 'Full audit trail of all executions and eligibility checks', action: () => navigate('/app/records'), badge: null },
          ].map(({ icon: Icon, label, desc, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-charcoal-light/50 transition-colors group text-left"
            >
              <div className="w-8 h-8 bg-charcoal-light border border-charcoal-border rounded-app flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-mint transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{label}</p>
                <p className="text-xs text-gray-600">{desc}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-400">Control reminder:</span> You can pause ReFi Managed at any time. Pausing stops new broker submissions. It does not cancel orders already sent to your broker. Changing your profile, strategy, or guardrails creates a new execution policy version and may temporarily pause automatic execution for review.
        </p>
      </div>
    </div>
  );
}
