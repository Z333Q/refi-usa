import { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronRight, Globe, Users, FileText, Shield, Clock, Activity } from 'lucide-react';

const METRICS = [
  { label: 'Total Clients', value: '2,847', icon: Users, trend: '+12 this week' },
  { label: 'States Served', value: '48', icon: Globe, trend: '2 pending review' },
  { label: 'Compliance Score', value: '100%', icon: Shield, trend: 'All checks pass' },
  { label: 'Advice Delivered', value: '18,432', icon: Activity, trend: 'Last 30 days' },
  { label: 'Avg Response Time', value: '1.2s', icon: Clock, trend: 'Automated only' },
  { label: 'Disclosures Signed', value: '2,847', icon: FileText, trend: '100% coverage' },
];

const REQUIREMENTS = [
  { id: 1, title: 'Internet-Only Advice Delivery', status: 'pass', detail: 'All advice delivered exclusively through the web platform. Zero telephone or in-person consultations recorded.' },
  { id: 2, title: 'Functioning Interactive Website', status: 'pass', detail: 'Platform uptime 99.97% over trailing 12 months. Real-time portfolio analytics, trade execution, and compliance reporting available 24/7.' },
  { id: 3, title: 'De Minimis Personal Contact', status: 'pass', detail: 'Support interactions limited to technical/operational issues only. Zero advisory content detected in 14,832 support tickets (NLP boundary enforcement active).' },
  { id: 4, title: 'No In-Person Business', status: 'pass', detail: 'No physical office locations. All team members operate remotely. No client meetings scheduled or conducted.' },
  { id: 5, title: 'SEC Registration Maintained', status: 'pass', detail: 'Form ADV filed and current. Annual amendment submitted 2026-03-15. All material changes disclosed within 48 hours.' },
  { id: 6, title: 'Written Disclosure Statement', status: 'pass', detail: 'ADV Part 2A/2B delivered to all clients at onboarding. Acknowledgment signatures collected and stored (zk-attested).' },
  { id: 7, title: 'Effective Date Compliance', status: 'pass', detail: 'Registered under Rule 203A-2(e) effective 2025-06-01. Continuous compliance since inception.' },
  { id: 8, title: 'Recordkeeping (Rule 204-2)', status: 'pass', detail: 'All required records maintained digitally with cryptographic integrity proofs. Merkle-tree audit trail with tamper-evident timestamps.' },
];

const AUDIT_TRAIL = [
  { time: '2026-05-04 14:32:01', event: 'Compliance check completed', result: 'All 8 requirements satisfied', hash: '0x7a3f...e921' },
  { time: '2026-05-04 14:00:00', event: 'Hourly attestation published', result: 'zk-proof verified on-chain', hash: '0x1b4c...d847' },
  { time: '2026-05-04 13:45:12', event: 'New client onboarded', result: 'Disclosure signed, profile complete', hash: '0x9e2d...f103' },
  { time: '2026-05-04 13:30:00', event: 'Support boundary enforced', result: 'Advisory keyword blocked', hash: '0x4f8a...b276' },
  { time: '2026-05-04 13:00:00', event: 'Hourly attestation published', result: 'zk-proof verified on-chain', hash: '0xc3d1...a459' },
];

export default function EvidenceConsole() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Evidence Console</h1>
        <p className="text-sm text-gray-400 mt-1">Real-time proof of SEC Rule 203A-2(e) Internet Adviser compliance</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {METRICS.map(({ label, value, icon: Icon, trend }) => (
          <div key={label} className="bg-charcoal rounded-app-md border border-charcoal-border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-lg font-bold text-white font-mono-data">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          </div>
        ))}
      </div>

      {/* Status banner */}
      <div className="flex items-center gap-3 p-4 mb-6 rounded-app-md bg-success/5 border border-success/20">
        <CheckCircle className="w-5 h-5 text-success shrink-0" />
        <div>
          <p className="text-sm font-medium text-success">All Internet Adviser requirements satisfied</p>
          <p className="text-xs text-gray-400 mt-0.5">Last verified: 2026-05-04 14:32:01 UTC | Next check: 15:00:00 UTC</p>
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3">Rule 203A-2(e) Requirements</h2>
        <div className="space-y-1">
          {REQUIREMENTS.map((req) => (
            <div key={req.id} className="bg-charcoal rounded-app border border-charcoal-border overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-charcoal-light/50 transition-colors"
              >
                {expanded === req.id ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                )}
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <span className="text-sm text-white flex-1">{req.title}</span>
                <span className="text-xs text-success font-medium uppercase">Pass</span>
              </button>
              {expanded === req.id && (
                <div className="px-4 pb-3 pl-12">
                  <p className="text-xs text-gray-400 leading-relaxed">{req.detail}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Audit trail */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Live Audit Trail</h2>
        <div className="bg-charcoal rounded-app-md border border-charcoal-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-charcoal-border">
                <th className="text-left text-gray-500 font-medium px-4 py-2">Timestamp</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Event</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Result</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Proof Hash</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_TRAIL.map((row, i) => (
                <tr key={i} className="border-b border-charcoal-border/50 last:border-0">
                  <td className="px-4 py-2 text-gray-400 font-mono-data">{row.time}</td>
                  <td className="px-4 py-2 text-white">{row.event}</td>
                  <td className="px-4 py-2 text-gray-300">{row.result}</td>
                  <td className="px-4 py-2 text-mint font-mono-data">{row.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
