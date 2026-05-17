import { useEffect, useState } from 'react';
import { Activity as ActivityIcon, CheckCircle, XCircle, Info, TrendingUp, User, FileText, Zap, AlertCircle, ShieldCheck, Link2 } from 'lucide-react';
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

const EVENT_ICONS: Record<string, React.ElementType> = {
  profile_created: User,
  recommendation_created: TrendingUp,
  recommendation_approved: CheckCircle,
  recommendation_dismissed: XCircle,
  recommendation_exception: AlertCircle,
  broker_order_filled: Zap,
  broker_order_submitted: Zap,
  strategy_approved: ShieldCheck,
  execution_policy_approved: ShieldCheck,
  brokerage_connected: Link2,
  document_viewed: FileText,
  default: Info,
};

const EVENT_COLORS: Record<string, string> = {
  profile_created: 'text-mint',
  recommendation_created: 'text-mint',
  recommendation_approved: 'text-success',
  recommendation_dismissed: 'text-gray-500',
  recommendation_exception: 'text-warning',
  broker_order_filled: 'text-success',
  broker_order_submitted: 'text-mint',
  strategy_approved: 'text-success',
  execution_policy_approved: 'text-success',
  brokerage_connected: 'text-mint',
  document_viewed: 'text-warning',
  default: 'text-gray-400',
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Activity() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('activity_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-1">Activity</h1>
        <p className="text-sm text-gray-500">A complete record of recommendations, approvals, orders, and account events.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-charcoal-lighter border border-charcoal-border rounded-app-md animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-12 text-center">
          <ActivityIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-1">No activity yet</p>
          <p className="text-xs text-gray-500">Your activity history will appear here once you start investing.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {events.map((event, i) => {
            const Icon = EVENT_ICONS[event.event_type] || EVENT_ICONS.default;
            const color = EVENT_COLORS[event.event_type] || EVENT_COLORS.default;

            return (
              <div key={event.id} className="relative flex gap-4 pb-1">
                {/* Timeline line */}
                {i < events.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-charcoal-border" />
                )}
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full bg-charcoal-lighter border border-charcoal-border flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {/* Content */}
                <div className="flex-1 bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4 mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{event.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge variant={
                        event.status === 'completed' ? 'success' :
                        event.status === 'failed' ? 'error' : 'neutral'
                      }>
                        {event.status}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">{formatDateTime(event.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-400">Detailed records:</span> This activity log is a durable record of all actions taken in your account. Recommendation IDs, approval timestamps, and order references are retained for compliance purposes and available on request.
        </p>
      </div>
    </div>
  );
}
