import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, X, ChevronDown, ChevronUp, Clock, Zap,
  AlertCircle, Activity, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface Recommendation {
  id: string;
  title: string;
  summary: string;
  reason: string;
  profile_fit: string;
  estimated_impact: string;
  estimated_cost: string;
  status: string;
  automation_status: string;
  model_version: string;
  profile_version: number;
  execution_policy_version: number;
  rec_type: string;
  created_at: string;
}

type Filter = 'all' | 'pending' | 'approved' | 'dismissed';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function automationBadge(status: string, tier: string): { label: string; variant: 'mint' | 'success' | 'warning' | 'neutral' | 'error' } {
  if (tier !== 'managed') return { label: 'Review & act', variant: 'mint' };
  const map: Record<string, { label: string; variant: 'mint' | 'success' | 'warning' | 'neutral' | 'error' }> = {
    eligible: { label: 'Auto-eligible', variant: 'success' },
    exception_review: { label: 'Exception review', variant: 'warning' },
    submitted: { label: 'Submitted to broker', variant: 'success' },
    filled: { label: 'Filled', variant: 'success' },
    blocked_guardrail: { label: 'Blocked by guardrail', variant: 'error' },
    blocked_stale: { label: 'Blocked — stale data', variant: 'warning' },
    pending_check: { label: 'Eligibility pending', variant: 'neutral' },
    dismissed: { label: 'Dismissed', variant: 'neutral' },
  };
  return map[status] || { label: 'Pending', variant: 'neutral' };
}

function RecCard({
  rec,
  tier,
  onApprove,
  onDismiss,
}: {
  rec: Recommendation;
  tier: string;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);
  const autoBadge = automationBadge(rec.automation_status, tier);
  const isPending = rec.status === 'pending';
  const isManaged = tier === 'managed';

  async function handleApprove() {
    setActing(true);
    await onApprove(rec.id);
    setActing(false);
  }

  async function handleDismiss() {
    setActing(true);
    await onDismiss(rec.id);
    setActing(false);
  }

  return (
    <div className={`bg-charcoal-lighter border rounded-app-md overflow-hidden transition-all ${
      isPending ? 'border-charcoal-border' : 'border-charcoal-border/40 opacity-70'
    }`}>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={autoBadge.variant}>{autoBadge.label}</Badge>
              {rec.status === 'approved' && <Badge variant="success">Approved</Badge>}
              {rec.status === 'dismissed' && <Badge variant="neutral">Dismissed</Badge>}
              <span className="text-xs text-gray-600 flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                {formatDate(rec.created_at)}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{rec.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{rec.summary}</p>
          </div>
        </div>

        {isManaged && (
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="text-xs text-gray-600 font-mono">Model: {rec.model_version || 'refi-advice-0.9.2'}</span>
            <div className="w-px h-3 bg-charcoal-border" />
            <span className="text-xs text-gray-600">Profile v{rec.profile_version || 1}</span>
            <div className="w-px h-3 bg-charcoal-border" />
            <span className="text-xs text-gray-600">Policy v{rec.execution_policy_version || 1}</span>
            <div className="w-px h-3 bg-charcoal-border" />
            <span className="text-xs font-mono text-gray-700">#{rec.id.slice(0, 8)}</span>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-mint transition-colors mt-3"
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Less detail</> : <><ChevronDown className="w-3.5 h-3.5" /> Full detail</>}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-charcoal-border bg-charcoal-light/50 px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Why now</p>
            <p className="text-sm text-gray-300 leading-relaxed">{rec.reason}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Profile fit</p>
            <p className="text-sm text-gray-300">{rec.profile_fit}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-charcoal-lighter border border-charcoal-border rounded-app p-3">
              <p className="text-xs text-gray-500 mb-1">Expected impact</p>
              <p className="text-xs text-white">{rec.estimated_impact}</p>
            </div>
            <div className="bg-charcoal-lighter border border-charcoal-border rounded-app p-3">
              <p className="text-xs text-gray-500 mb-1">Cost estimate</p>
              <p className="text-xs font-mono text-white">{rec.estimated_cost || 'Minimal — index ETF'}</p>
            </div>
          </div>

          {isManaged && (
            <div className="bg-charcoal-light border border-charcoal-border rounded-app p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Advice evidence</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  ['Generated by', 'ReFi software'],
                  ['Model', rec.model_version || 'refi-advice-0.9.2'],
                  ['Profile version', `v${rec.profile_version || 1}`],
                  ['Policy version', `v${rec.execution_policy_version || 1}`],
                  ['Record ID', `#${rec.id.slice(0, 16)}…`],
                  ['Generated', formatDate(rec.created_at)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="text-gray-600">{k}: </span>
                    <span className="font-mono text-gray-400">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isPending && !isManaged && (
        <div className="px-5 pb-5 flex items-center gap-3">
          <Button size="sm" onClick={handleApprove} loading={acting} className="gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> I'll act on this
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDismiss} disabled={acting} className="gap-1.5">
            <X className="w-3.5 h-3.5" /> Not now
          </Button>
        </div>
      )}

      {isPending && isManaged && rec.automation_status === 'exception_review' && (
        <div className="px-5 pb-5 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-warning/5 border border-warning/20 rounded-app px-3 py-2 flex-1 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0" />
            <span className="text-xs text-warning">Held for exception review — outside your execution policy.</span>
          </div>
        </div>
      )}

      {(rec.automation_status === 'submitted' || rec.automation_status === 'filled') && (
        <div className="px-5 pb-4 flex items-center gap-2 text-xs text-success">
          <Zap className="w-3.5 h-3.5" />
          Automatically submitted to your connected broker
        </div>
      )}

      {rec.status === 'approved' && !isManaged && (
        <div className="px-5 pb-4 flex items-center gap-2 text-xs text-success">
          <CheckCircle className="w-3.5 h-3.5" />
          Acknowledged — you indicated you'll act on this manually
        </div>
      )}
    </div>
  );
}

export default function Recommendations() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  const tier = profile?.subscription_tier || 'signal';

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    const { data } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setRecs(data || []);
    setLoading(false);
  }

  async function handleApprove(id: string) {
    await supabase.from('recommendations').update({ status: 'approved' }).eq('id', id);
    await supabase.from('activity_events').insert({
      user_id: user!.id,
      event_type: 'recommendation_approved',
      title: tier === 'managed' ? 'Recommendation submitted' : 'Recommendation acknowledged',
      description: tier === 'managed'
        ? 'Recommendation approved and submitted to your brokerage.'
        : "You indicated you'll act on this recommendation manually.",
      status: 'completed',
    });
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  }

  async function handleDismiss(id: string) {
    await supabase.from('recommendations').update({ status: 'dismissed' }).eq('id', id);
    await supabase.from('activity_events').insert({
      user_id: user!.id,
      event_type: 'recommendation_dismissed',
      title: 'Recommendation skipped',
      description: 'You chose not to act on this recommendation at this time.',
      status: 'completed',
    });
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
  }

  const filtered = recs.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = recs.filter(r => r.status === 'pending').length;
  const exceptionCount = recs.filter(r => r.automation_status === 'exception_review').length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold text-white">Recommendations</h1>
          {pendingCount > 0 && (
            <span className="w-6 h-6 bg-mint text-charcoal rounded-full text-xs font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
          {tier === 'managed' && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-mint">
              <Zap className="w-3 h-3" /> ReFi Managed
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {tier === 'managed'
            ? 'Software-generated recommendations. Eligible ones submit automatically. Exceptions require your review.'
            : 'Personalized portfolio recommendations from your goals and risk profile.'}
        </p>
      </div>

      {tier === 'managed' && exceptionCount > 0 && (
        <div
          className="bg-warning/5 border border-warning/20 rounded-app-md p-4 mb-5 flex items-center gap-3 cursor-pointer hover:bg-warning/10 transition-colors"
          onClick={() => navigate('/app/exceptions')}
        >
          <AlertCircle className="w-4 h-4 text-warning shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-warning">
              {exceptionCount} recommendation{exceptionCount > 1 ? 's' : ''} need{exceptionCount === 1 ? 's' : ''} your review
            </p>
            <p className="text-xs text-gray-500">Outside your approved execution policy.</p>
          </div>
          <span className="text-xs text-warning">Go to Exception Review →</span>
        </div>
      )}

      <div className="flex gap-1 mb-6 flex-wrap">
        {(['all', 'pending', 'approved', 'dismissed'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-app text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-mint text-charcoal' : 'bg-charcoal-lighter border border-charcoal-border text-gray-400 hover:text-white'
            }`}
          >
            {f} ({f === 'all' ? recs.length : recs.filter(r => r.status === f).length})
          </button>
        ))}
        {tier !== 'managed' && (
          <button
            onClick={() => navigate('/app/subscription')}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-app text-xs font-medium text-gray-500 border border-charcoal-border hover:border-mint/40 hover:text-mint transition-colors"
          >
            <Zap className="w-3 h-3" /> Upgrade to Managed
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-36 bg-charcoal-lighter border border-charcoal-border rounded-app-md animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-12 text-center">
          <Activity className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-1">No recommendations here</p>
          <p className="text-xs text-gray-500">New recommendations will appear when your portfolio needs attention.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(rec => (
            <RecCard key={rec.id} rec={rec} tier={tier} onApprove={handleApprove} onDismiss={handleDismiss} />
          ))}
        </div>
      )}

      <div className="mt-8 bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
        {tier === 'managed' ? (
          <div className="flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-400">ReFi Managed:</span> Auto-eligible recommendations are submitted to your broker inside your approved policy. Exception-review items require your input. All recommendations and executions are permanently recorded.
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-medium text-gray-400">ReFi Signal:</span> Recommendations are generated by software from your investor profile. They are not individually tailored advice from a human adviser. Review them and act through your brokerage at your discretion.{' '}
            <button onClick={() => navigate('/app/subscription')} className="text-mint hover:text-mint-light transition-colors">
              Upgrade to ReFi Managed
            </button>{' '}for automatic execution.
          </p>
        )}
      </div>
    </div>
  );
}
