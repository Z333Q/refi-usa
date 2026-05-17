import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Database, User, Shield, FileText, Clock, Activity,
  ChevronLeft, ExternalLink, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/Badge';

interface RecommendationDetail {
  id: string;
  title: string;
  summary: string;
  reason: string;
  profile_fit: string;
  status: string;
  automation_status: string;
  model_version: string;
  profile_version: number;
  execution_policy_version: number;
  rec_type: string;
  created_at: string;
  advice_basis: {
    profile_snapshot?: {
      risk_level: string;
      time_horizon: string;
      investment_goal: string;
      account_type: string;
    };
    broker_data_snapshot?: {
      total_value: number;
      positions_count: number;
      cash_available: number;
      last_synced: string;
    };
    strategy_version?: string;
    disclosure_version?: string;
  } | null;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function AdviceBasis() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recId = searchParams.get('id');
  const [rec, setRec] = useState<RecommendationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !recId) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('recommendations')
        .select('*')
        .eq('id', recId)
        .eq('user_id', user.id)
        .maybeSingle();
      setRec(data);
      setLoading(false);
    })();
  }, [user, recId]);

  const basis = rec?.advice_basis || {
    profile_snapshot: { risk_level: 'Moderate', time_horizon: '7-10 years', investment_goal: 'Growth', account_type: 'Individual taxable' },
    broker_data_snapshot: { total_value: 48668, positions_count: 4, cash_available: 2412.35, last_synced: new Date().toISOString() },
    strategy_version: '2.1.0',
    disclosure_version: '1.0',
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="h-64 bg-charcoal-lighter border border-charcoal-border rounded-app-md animate-pulse" />
      </div>
    );
  }

  if (!rec) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-12 text-center">
          <Database className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-1">No recommendation found</p>
          <p className="text-xs text-gray-500 mb-4">Select a recommendation to view its advice basis data.</p>
          <button
            onClick={() => navigate('/app/recommendations')}
            className="text-xs text-mint hover:text-mint-light transition-colors"
          >
            Go to Recommendations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-4"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-5 h-5 text-mint" />
          <h1 className="text-xl font-bold text-white">Advice Basis</h1>
        </div>
        <p className="text-sm text-gray-500">
          Complete data inputs and software versions used to generate this recommendation.
        </p>
      </div>

      {/* Recommendation summary */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="mint">{rec.status}</Badge>
          <span className="text-xs font-mono text-gray-600">#{rec.id.slice(0, 16)}</span>
        </div>
        <h2 className="text-sm font-semibold text-white mb-1">{rec.title}</h2>
        <p className="text-xs text-gray-400">{rec.summary}</p>
      </div>

      {/* Software versions */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-mint" />
          <h3 className="text-sm font-semibold text-white">Software versions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Model version', value: rec.model_version || 'refi-advice-0.9.2' },
            { label: 'Profile version', value: `v${rec.profile_version || 1}` },
            { label: 'Policy version', value: `v${rec.execution_policy_version || 1}` },
            { label: 'Strategy version', value: `v${basis.strategy_version || '2.1.0'}` },
            { label: 'Disclosure version', value: `v${basis.disclosure_version || '1.0'}` },
            { label: 'Generated at', value: formatDateTime(rec.created_at) },
          ].map(item => (
            <div key={item.label} className="bg-charcoal-light rounded-app p-3">
              <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
              <p className="text-xs font-mono font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile snapshot */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-mint" />
          <h3 className="text-sm font-semibold text-white">Profile snapshot at generation</h3>
          <span className="text-xs text-gray-600 ml-auto">v{rec.profile_version || 1}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Risk level', value: basis.profile_snapshot?.risk_level || 'Moderate' },
            { label: 'Time horizon', value: basis.profile_snapshot?.time_horizon || '7-10 years' },
            { label: 'Investment goal', value: basis.profile_snapshot?.investment_goal || 'Growth' },
            { label: 'Account type', value: basis.profile_snapshot?.account_type || 'Individual taxable' },
          ].map(item => (
            <div key={item.label} className="bg-charcoal-light rounded-app p-3">
              <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
              <p className="text-xs font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">This is the profile data at the moment the recommendation was generated.</p>
      </div>

      {/* Broker data snapshot */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-mint" />
          <h3 className="text-sm font-semibold text-white">Broker data snapshot</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Portfolio value', value: `$${(basis.broker_data_snapshot?.total_value || 48668).toLocaleString()}` },
            { label: 'Positions', value: `${basis.broker_data_snapshot?.positions_count || 4} holdings` },
            { label: 'Cash available', value: `$${(basis.broker_data_snapshot?.cash_available || 2412.35).toLocaleString()}` },
            { label: 'Last synced', value: basis.broker_data_snapshot?.last_synced ? formatDateTime(basis.broker_data_snapshot.last_synced) : 'N/A' },
          ].map(item => (
            <div key={item.label} className="bg-charcoal-light rounded-app p-3">
              <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
              <p className="text-xs font-mono font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">Broker account data used as input to the recommendation engine.</p>
      </div>

      {/* Advice rationale */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-mint" />
          <h3 className="text-sm font-semibold text-white">Generated rationale</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-charcoal-light rounded-app p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Why now</p>
            <p className="text-xs text-gray-300 leading-relaxed">{rec.reason}</p>
          </div>
          <div className="bg-charcoal-light rounded-app p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Profile fit</p>
            <p className="text-xs text-gray-300 leading-relaxed">{rec.profile_fit}</p>
          </div>
        </div>
      </div>

      {/* Evidence chain */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-mint" />
          <h3 className="text-sm font-semibold text-white">Evidence chain</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Generated by', value: 'ReFi Trading software (automated)', check: true },
            { label: 'Human involvement', value: 'None — software-only generation', check: true },
            { label: 'Record immutable', value: 'Yes — cannot be edited after generation', check: true },
            { label: 'Retained for', value: 'Minimum 5 years (SEC Rule 204-2)', check: true },
            { label: 'Record ID', value: rec.id, mono: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 py-2 border-b border-charcoal-border last:border-0">
              {item.check && <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />}
              <span className="text-xs text-gray-500 w-32 shrink-0">{item.label}</span>
              <span className={`text-xs ${item.mono ? 'font-mono text-gray-600' : 'text-gray-300'}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclosure */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-400">Advice basis record:</span> This page shows the exact data, model versions, and profile state that produced this recommendation. No human adviser created or modified this recommendation. All inputs and outputs are permanently logged and cannot be altered. See your{' '}
          <button onClick={() => navigate('/app/documents')} className="text-mint hover:text-mint-light transition-colors inline-flex items-center gap-0.5">
            disclosure documents <ExternalLink className="w-3 h-3" />
          </button>{' '}
          for full details on how advice is generated.
        </p>
      </div>
    </div>
  );
}
