import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, CheckCircle, X, ChevronDown, ChevronUp,
  Clock, Shield, TrendingUp
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
  created_at: string;
}

const EXCEPTION_REASONS: Record<string, string> = {
  tax_impact: 'Estimated tax impact exceeds your threshold',
  position_limit: 'Would exceed maximum position size in your policy',
  order_size: 'Order value exceeds your maximum single-order limit',
  stale_data: 'Broker account data is older than allowed by your policy',
  disclosure_required: 'Updated disclosure acceptance is required',
  new_asset_class: 'Recommendation involves an asset class not in your approved universe',
  concentration: 'Would create sector concentration above your guardrail',
  volatility: 'Market volatility exceeds your review threshold',
};

function getExceptionReason(rec: Recommendation): string {
  const r = Math.abs(rec.id.charCodeAt(0)) % Object.keys(EXCEPTION_REASONS).length;
  return Object.values(EXCEPTION_REASONS)[r];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ExceptionCard({
  rec,
  onApprove,
  onDismiss,
}: {
  rec: Recommendation;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);
  const exceptionReason = getExceptionReason(rec);

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
    <div className="bg-charcoal-lighter border border-warning/20 rounded-app-md overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-warning/10 border border-warning/20 rounded-app flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="warning">Review required</Badge>
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(rec.created_at)}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{rec.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{rec.summary}</p>
          </div>
        </div>

        <div className="bg-warning/5 border border-warning/10 rounded-app px-3 py-2 mb-3">
          <p className="text-xs font-medium text-warning mb-0.5">Why this needs your review</p>
          <p className="text-xs text-gray-400">{exceptionReason}</p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-mint transition-colors"
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Less detail</> : <><ChevronDown className="w-3.5 h-3.5" /> Full recommendation detail</>}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-charcoal-border bg-charcoal-light/50 px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Rationale</p>
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
              <p className="text-xs font-mono text-white">{rec.estimated_cost || 'See detail'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="text-gray-600">Model: <span className="font-mono text-gray-400">{rec.model_version}</span></span>
            <span className="text-gray-600">Profile v<span className="text-gray-400">{rec.profile_version}</span></span>
            <span className="text-gray-600">ID: <span className="font-mono text-gray-400 truncate max-w-[80px] inline-block align-bottom">{rec.id}</span></span>
          </div>
        </div>
      )}

      <div className="px-5 pb-5 flex items-center gap-3">
        <Button size="sm" onClick={handleApprove} loading={acting} className="gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> Approve this exception
        </Button>
        <Button variant="secondary" size="sm" onClick={handleDismiss} disabled={acting} className="gap-1.5">
          <X className="w-3.5 h-3.5" /> Dismiss
        </Button>
      </div>
    </div>
  );
}

export default function ExceptionReview() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [exceptions, setExceptions] = useState<Recommendation[]>([]);
  const [resolved, setResolved] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user.id)
      .in('automation_status', ['exception_review', 'pending_check'])
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setExceptions(data || []);
        setLoading(false);
      });
  }, [user]);

  async function handleApprove(id: string) {
    await supabase.from('recommendations').update({
      status: 'approved',
      automation_status: 'exception_approved',
    }).eq('id', id);
    await supabase.from('activity_events').insert({
      user_id: user!.id,
      event_type: 'exception_approved',
      title: 'Exception approved',
      description: 'You manually approved a recommendation that was outside your automatic execution policy. It has been submitted to your brokerage.',
      status: 'completed',
    });
    const item = exceptions.find(e => e.id === id);
    if (item) setResolved(prev => [...prev, { ...item, status: 'approved' }]);
    setExceptions(prev => prev.filter(e => e.id !== id));
  }

  async function handleDismiss(id: string) {
    await supabase.from('recommendations').update({
      status: 'dismissed',
      automation_status: 'dismissed',
    }).eq('id', id);
    await supabase.from('activity_events').insert({
      user_id: user!.id,
      event_type: 'exception_dismissed',
      title: 'Exception dismissed',
      description: 'You dismissed a recommendation that was held for exception review.',
      status: 'completed',
    });
    setExceptions(prev => prev.filter(e => e.id !== id));
  }

  if (profile?.subscription_tier !== 'managed') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-12 text-center">
          <Shield className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-2">Exception Review requires ReFi Managed</p>
          <p className="text-xs text-gray-500 mb-4">Exceptions arise when automatic execution is paused for a specific recommendation.</p>
          <Button onClick={() => navigate('/app/subscription')} size="sm">Upgrade to ReFi Managed</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <AlertCircle className="w-5 h-5 text-warning" />
          <h1 className="text-xl font-bold text-white">Exception Review</h1>
          {exceptions.length > 0 && (
            <span className="w-6 h-6 bg-warning text-charcoal rounded-full text-xs font-bold flex items-center justify-center">
              {exceptions.length}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">Recommendations that cannot be executed automatically under your approved execution policy.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-40 bg-charcoal-lighter border border-charcoal-border rounded-app-md animate-pulse" />)}
        </div>
      ) : exceptions.length === 0 ? (
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-12 text-center mb-6">
          <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-1">No exceptions to review</p>
          <p className="text-xs text-gray-500">All pending recommendations are within your approved policy and will be submitted automatically.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {exceptions.map(rec => (
            <ExceptionCard key={rec.id} rec={rec} onApprove={handleApprove} onDismiss={handleDismiss} />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolved this session</h2>
          <div className="space-y-2">
            {resolved.map(rec => (
              <div key={rec.id} className={`flex items-center gap-3 p-4 bg-charcoal-lighter border rounded-app-md ${
                rec.status === 'approved' ? 'border-success/20' : 'border-charcoal-border opacity-60'
              }`}>
                {rec.status === 'approved'
                  ? <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  : <X className="w-4 h-4 text-gray-500 shrink-0" />
                }
                <p className="text-sm text-gray-300 flex-1 min-w-0 truncate">{rec.title}</p>
                <Badge variant={rec.status === 'approved' ? 'success' : 'neutral'}>
                  {rec.status === 'approved' ? 'Approved' : 'Dismissed'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-mint" />
          <p className="text-sm font-semibold text-white">Why exceptions exist</p>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">
          Managed execution is fully automatic for recommendations inside your approved policy. When a recommendation would breach a guardrail, involve a new asset class, exceed an order limit, or trigger a tax or data condition, it moves here for your review before any order is submitted.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(EXCEPTION_REASONS).slice(0, 4).map(r => (
            <div key={r} className="flex items-start gap-1.5">
              <div className="w-1 h-1 bg-warning rounded-full shrink-0 mt-1.5" />
              <span className="text-xs text-gray-600">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
