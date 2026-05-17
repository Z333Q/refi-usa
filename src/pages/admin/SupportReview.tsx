import { useState } from 'react';
import { MessageSquare, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const STATS = [
  { label: 'Total Interactions', value: '14,832' },
  { label: 'Boundary Enforced', value: '47' },
  { label: 'False Positives', value: '3' },
  { label: 'Compliance Rate', value: '100%' },
];

const KEYWORD_TRIGGERS = [
  { keyword: 'should I buy', count: 18, action: 'Blocked' },
  { keyword: 'recommend', count: 12, action: 'Blocked' },
  { keyword: 'what stock', count: 8, action: 'Blocked' },
  { keyword: 'invest in', count: 5, action: 'Blocked' },
  { keyword: 'good time to', count: 4, action: 'Blocked' },
];

type EventStatus = 'all' | 'blocked' | 'resolved';

const EVENTS = [
  { id: 1, time: '2026-05-04 14:22', user: 'Client #2841', message: 'Should I buy more VTI right now?', status: 'blocked' as const, resolution: 'Auto-response: advisory content cannot be provided via support' },
  { id: 2, time: '2026-05-04 13:45', user: 'Client #2103', message: 'How do I connect my Schwab account?', status: 'resolved' as const, resolution: 'Technical guidance provided (non-advisory)' },
  { id: 3, time: '2026-05-04 13:12', user: 'Client #1892', message: 'Can you recommend a better allocation?', status: 'blocked' as const, resolution: 'Auto-response: advisory content cannot be provided via support' },
  { id: 4, time: '2026-05-04 12:58', user: 'Client #2567', message: 'My portfolio page is loading slowly', status: 'resolved' as const, resolution: 'Cache cleared, performance restored' },
  { id: 5, time: '2026-05-04 12:30', user: 'Client #1456', message: 'Is now a good time to sell bonds?', status: 'blocked' as const, resolution: 'Auto-response: advisory content cannot be provided via support' },
  { id: 6, time: '2026-05-04 11:45', user: 'Client #2789', message: 'I need help updating my risk profile', status: 'resolved' as const, resolution: 'Directed to self-service risk questionnaire' },
  { id: 7, time: '2026-05-04 11:20', user: 'Client #2341', message: 'What do you think about investing in crypto?', status: 'blocked' as const, resolution: 'Auto-response: advisory content cannot be provided via support' },
  { id: 8, time: '2026-05-04 10:55', user: 'Client #1678', message: 'Password reset not working', status: 'resolved' as const, resolution: 'Reset link re-sent successfully' },
];

export default function SupportReview() {
  const [filter, setFilter] = useState<EventStatus>('all');
  const filtered = filter === 'all' ? EVENTS : EVENTS.filter(e => e.status === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Support Boundary Review</h1>
        <p className="text-sm text-gray-400 mt-1">NLP-enforced advisory boundary monitoring and audit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATS.map(({ label, value }) => (
          <div key={label} className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
            <span className="text-xs text-gray-500">{label}</span>
            <p className="text-lg font-bold text-white font-mono-data mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Keyword triggers */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Keyword Trigger Frequency
        </h2>
        <div className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
          <div className="space-y-2">
            {KEYWORD_TRIGGERS.map((trigger) => (
              <div key={trigger.keyword} className="flex items-center gap-3">
                <span className="text-xs text-white font-mono-data w-32 shrink-0">"{trigger.keyword}"</span>
                <div className="flex-1 bg-charcoal-lighter rounded-full h-2 overflow-hidden">
                  <div className="bg-error/60 h-full rounded-full" style={{ width: `${(trigger.count / 18) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">{trigger.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-mint" />
            Support Events
          </h2>
          <div className="flex gap-1">
            {(['all', 'blocked', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-app text-xs font-medium transition-colors ${
                  filter === f ? 'bg-charcoal-lighter text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((event) => (
            <div key={event.id} className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
              <div className="flex items-start gap-3">
                {event.status === 'blocked' ? (
                  <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono-data">{event.time}</span>
                    <span className="text-xs text-gray-400">{event.user}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      event.status === 'blocked' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-white mb-1">"{event.message}"</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {event.resolution}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
