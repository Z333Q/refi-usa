import { useEffect, useState } from 'react';
import {
  Shield, Clock, CheckCircle, FileText, Activity, AlertCircle,
  Download, ChevronDown, ChevronUp, User, Zap, Target, Pause
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/Badge';

interface ActivityEvent {
  id: string;
  event_type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface Recommendation {
  id: string;
  title: string;
  summary: string;
  status: string;
  automation_status: string;
  model_version: string;
  profile_version: number;
  execution_policy_version: number;
  created_at: string;
  reason: string;
  profile_fit: string;
  estimated_impact: string;
}

type RecordTab = 'profile' | 'strategy' | 'recommendations' | 'execution_policy' | 'broker_orders' | 'disclosures' | 'support' | 'pauses' | 'export';

const TABS: { id: RecordTab; label: string; icon: typeof Shield }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'strategy', label: 'Strategy', icon: Target },
  { id: 'recommendations', label: 'Recommendations', icon: Activity },
  { id: 'execution_policy', label: 'Execution Policy', icon: Shield },
  { id: 'broker_orders', label: 'Broker Orders', icon: Zap },
  { id: 'disclosures', label: 'Disclosures', icon: FileText },
  { id: 'support', label: 'Support', icon: AlertCircle },
  { id: 'pauses', label: 'Pauses & Exceptions', icon: Pause },
  { id: 'export', label: 'Export', icon: Download },
];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function RecordRow({ event }: { event: ActivityEvent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border-b border-charcoal-border last:border-0 ${expanded ? 'bg-charcoal-light/30' : 'hover:bg-charcoal-light/20'} transition-colors`}>
      <button
        className="w-full flex items-start gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-7 h-7 bg-charcoal-light border border-charcoal-border rounded-app flex items-center justify-center shrink-0 mt-0.5">
          <Clock className="w-3 h-3 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white mb-0.5">{event.title}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono text-gray-600">{formatDateTime(event.created_at)}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-4 ml-11 space-y-2">
          <div className="bg-charcoal-light border border-charcoal-border rounded-app p-3">
            <p className="text-xs text-gray-400 leading-relaxed">{event.description}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div>
              <span className="text-gray-600">Record ID: </span>
              <span className="font-mono text-gray-500">{event.id}</span>
            </div>
            <div>
              <span className="text-gray-600">Event type: </span>
              <span className="font-mono text-gray-500">{event.event_type}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationRecord({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = rec.status === 'approved' ? 'success' : rec.status === 'dismissed' ? 'neutral' : 'mint';

  return (
    <div className={`border-b border-charcoal-border last:border-0 ${expanded ? 'bg-charcoal-light/30' : 'hover:bg-charcoal-light/20'} transition-colors`}>
      <button
        className="w-full flex items-start gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-7 h-7 bg-charcoal-light border border-charcoal-border rounded-app flex items-center justify-center shrink-0 mt-0.5">
          <Activity className="w-3 h-3 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-medium text-white">{rec.title}</p>
            <Badge variant={statusColor as 'mint' | 'success' | 'neutral'}>{rec.status}</Badge>
            {rec.automation_status && rec.automation_status !== 'pending_check' && (
              <Badge variant="warning">{rec.automation_status.replace('_', ' ')}</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 line-clamp-1">{rec.summary}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono text-gray-600">{formatDateTime(rec.created_at)}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-4 ml-11 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-charcoal-light border border-charcoal-border rounded-app p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rationale</p>
              <p className="text-xs text-gray-300 leading-relaxed">{rec.reason}</p>
            </div>
            <div className="bg-charcoal-light border border-charcoal-border rounded-app p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Profile fit</p>
              <p className="text-xs text-gray-300 leading-relaxed">{rec.profile_fit}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div><span className="text-gray-600">Model: </span><span className="font-mono text-gray-500">{rec.model_version || 'refi-advice-0.9.2'}</span></div>
            <div><span className="text-gray-600">Profile v</span><span className="font-mono text-gray-500">{rec.profile_version || 1}</span></div>
            <div><span className="text-gray-600">Policy v</span><span className="font-mono text-gray-500">{rec.execution_policy_version || 1}</span></div>
            <div><span className="text-gray-600">Record ID: </span><span className="font-mono text-gray-500">{rec.id}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-12 text-center">
      <FileText className="w-8 h-8 text-gray-600 mx-auto mb-3" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

export default function Records() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RecordTab>('profile');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: evts }, { data: recs }] = await Promise.all([
        supabase.from('activity_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('recommendations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setEvents(evts || []);
      setRecommendations(recs || []);
      setLoading(false);
    })();
  }, [user]);

  const filterEvents = (types: string[]) => events.filter(e => types.some(t => e.event_type.includes(t)));

  const profileEvents = filterEvents(['profile_created', 'profile_updated', 'onboarding']);
  const strategyEvents = filterEvents(['strategy_approved', 'strategy']);
  const policyEvents = filterEvents(['managed_activated', 'execution_policy', 'policy']);
  const brokerEvents = filterEvents(['broker_submission', 'trade_executed', 'order']);
  const disclosureEvents = filterEvents(['disclosure']);
  const supportEvents = filterEvents(['support']);
  const pauseEvents = filterEvents(['paused', 'resumed', 'exception']);

  function renderTabContent() {
    if (loading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-charcoal-lighter border border-charcoal-border rounded-app animate-pulse" />)}
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return profileEvents.length === 0
          ? <EmptyState message="No profile change records yet." />
          : <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">{profileEvents.map(e => <RecordRow key={e.id} event={e} />)}</div>;

      case 'strategy':
        return strategyEvents.length === 0
          ? <EmptyState message="No strategy records yet. Approve your strategy to create a record." />
          : <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">{strategyEvents.map(e => <RecordRow key={e.id} event={e} />)}</div>;

      case 'recommendations':
        return recommendations.length === 0
          ? <EmptyState message="No recommendation records yet. Recommendations will appear here once generated." />
          : <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">{recommendations.map(r => <RecommendationRecord key={r.id} rec={r} />)}</div>;

      case 'execution_policy':
        return policyEvents.length === 0
          ? <EmptyState message="No execution policy records yet. Activate ReFi Managed to create policy records." />
          : <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">{policyEvents.map(e => <RecordRow key={e.id} event={e} />)}</div>;

      case 'broker_orders':
        return brokerEvents.length === 0
          ? <EmptyState message="No broker order records yet. Orders will appear here when managed execution submits trades." />
          : <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">{brokerEvents.map(e => <RecordRow key={e.id} event={e} />)}</div>;

      case 'disclosures':
        return disclosureEvents.length === 0
          ? <EmptyState message="No disclosure records yet. Accept disclosures during onboarding to create records." />
          : <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">{disclosureEvents.map(e => <RecordRow key={e.id} event={e} />)}</div>;

      case 'support':
        return supportEvents.length === 0
          ? <EmptyState message="No support records yet." />
          : <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">{supportEvents.map(e => <RecordRow key={e.id} event={e} />)}</div>;

      case 'pauses':
        return pauseEvents.length === 0
          ? <EmptyState message="No pause or exception records yet." />
          : <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">{pauseEvents.map(e => <RecordRow key={e.id} event={e} />)}</div>;

      case 'export':
        return (
          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6">
            <div className="text-center">
              <Download className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">Export records</h3>
              <p className="text-xs text-gray-500 mb-5 max-w-sm mx-auto">
                Download your complete advisory record as a structured data file for your personal records or regulatory inquiries.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md mx-auto mb-6">
                {[
                  { label: 'Activity events', count: events.length },
                  { label: 'Recommendations', count: recommendations.length },
                  { label: 'Profile records', count: profileEvents.length },
                  { label: 'Strategy records', count: strategyEvents.length },
                  { label: 'Policy records', count: policyEvents.length },
                  { label: 'Disclosure records', count: disclosureEvents.length },
                ].map(item => (
                  <div key={item.label} className="bg-charcoal-light border border-charcoal-border rounded-app p-3">
                    <p className="text-lg font-bold font-mono text-white">{item.count}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-mint text-charcoal font-medium text-sm rounded-app hover:bg-mint-light transition-colors">
                <Download className="w-4 h-4" /> Export all records (JSON)
              </button>
              <p className="text-xs text-gray-600 mt-3">Exports all records tied to your account in machine-readable format.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-mint" />
          <h1 className="text-xl font-bold text-white">Records Center</h1>
        </div>
        <p className="text-sm text-gray-500">
          Complete audit trail of all advisory actions, disclosures, and decisions. Every entry is immutable and timestamped.
        </p>
      </div>

      {/* Compliance banner */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4 mb-6 flex items-start gap-3">
        <Shield className="w-4 h-4 text-mint shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-medium text-white mb-0.5">SEC Rule 204-2 compliance record</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            All advice, decisions, disclosure acknowledgements, execution policy changes, broker orders, and profile changes are logged permanently. Records are retained for a minimum of 5 years.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="success">{events.length + recommendations.length} records</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-thin pb-1 border-b border-charcoal-border">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-mint border-mint'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {renderTabContent()}

      {/* Footer */}
      <div className="mt-6 bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-400">Records retention:</span> All records are retained for a minimum of 5 years in accordance with SEC Rule 204-2. Records cannot be modified or deleted by the client or ReFi Trading staff.
        </p>
      </div>
    </div>
  );
}
