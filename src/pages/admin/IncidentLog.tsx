import { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronRight, Clock, Shield } from 'lucide-react';

const SUBSYSTEMS = [
  { name: 'Algorithm Engine', status: 'healthy', uptime: '99.99%' },
  { name: 'Compliance Pipeline', status: 'healthy', uptime: '99.99%' },
  { name: 'Broker Connectivity', status: 'healthy', uptime: '99.97%' },
  { name: 'Oracle Network', status: 'healthy', uptime: '99.98%' },
  { name: 'zk-Proof Generator', status: 'healthy', uptime: '99.96%' },
  { name: 'Support Boundary NLP', status: 'healthy', uptime: '99.99%' },
  { name: 'Client Portal', status: 'healthy', uptime: '99.97%' },
  { name: 'Data Pipeline', status: 'healthy', uptime: '99.95%' },
];

const SLA_METRICS = [
  { label: 'MTTR', value: '4.2 min', desc: 'Mean time to resolve' },
  { label: 'MTTD', value: '12 sec', desc: 'Mean time to detect' },
  { label: 'Uptime (90d)', value: '99.97%', desc: 'All systems composite' },
  { label: 'SLA Breaches', value: '0', desc: 'Trailing 12 months' },
];

const INCIDENTS = [
  {
    id: 'INC-2026-042',
    time: '2026-04-28 09:14',
    severity: 'low',
    title: 'Elevated broker API latency (Fidelity)',
    duration: '6 min',
    affected: 12,
    rootCause: 'Fidelity upstream maintenance window caused 2x normal response times. No orders failed.',
    advisory: 'No impact on trade execution. All orders queued and filled within acceptable parameters.',
  },
  {
    id: 'INC-2026-038',
    time: '2026-04-15 15:32',
    severity: 'medium',
    title: 'zk-proof generation timeout for batch #8847',
    duration: '3 min',
    affected: 4,
    rootCause: 'Unusually large witness set (47 constraints) exceeded default timeout. Auto-retry succeeded.',
    advisory: 'Attestation delayed by 3 minutes for 4 clients. No compliance gap: trades held pending proof.',
  },
  {
    id: 'INC-2026-031',
    time: '2026-04-02 11:45',
    severity: 'low',
    title: 'Support NLP false positive on "buy" keyword',
    duration: '1 min',
    affected: 1,
    rootCause: 'Client asked "where can I buy a new phone?" in support chat. Boundary enforcer triggered incorrectly.',
    advisory: 'False positive resolved. NLP model updated to require financial context for trigger.',
  },
  {
    id: 'INC-2026-024',
    time: '2026-03-18 08:22',
    severity: 'medium',
    title: 'Oracle node consensus delay',
    duration: '8 min',
    affected: 23,
    rootCause: 'Chainlink Node Gamma experienced network partition. 2-of-3 consensus maintained; no attestation gap.',
    advisory: 'All attestations published within SLA. Node auto-recovered. Failover procedures validated.',
  },
  {
    id: 'INC-2026-019',
    time: '2026-03-05 16:58',
    severity: 'low',
    title: 'Client portal CSS rendering issue on Safari 17.3',
    duration: '2 hr',
    affected: 89,
    rootCause: 'Safari update introduced flexbox regression. Hotfix deployed.',
    advisory: 'Cosmetic only. No functionality or compliance impact. No data exposure.',
  },
];

export default function IncidentLog() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Incident Log</h1>
        <p className="text-sm text-gray-400 mt-1">System health monitoring and incident tracking with advisory impact assessment</p>
      </div>

      {/* System health */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3">System Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SUBSYSTEMS.map((sys) => (
            <div key={sys.name} className="bg-charcoal rounded-app border border-charcoal-border p-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white truncate">{sys.name}</p>
                <p className="text-xs text-gray-500 font-mono-data">{sys.uptime}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {SLA_METRICS.map(({ label, value, desc }) => (
          <div key={label} className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
            <span className="text-xs text-gray-500">{label}</span>
            <p className="text-lg font-bold text-white font-mono-data mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      {/* Incidents */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Incident History</h2>
        <div className="space-y-2">
          {INCIDENTS.map((inc) => (
            <div key={inc.id} className="bg-charcoal rounded-app-md border border-charcoal-border overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-charcoal-light/50 transition-colors"
              >
                {expanded === inc.id ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                )}
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${
                  inc.severity === 'medium' ? 'bg-warning/10 text-warning' : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {inc.severity}
                </span>
                <span className="text-sm text-white flex-1 truncate">{inc.title}</span>
                <span className="text-xs text-gray-500 font-mono-data shrink-0">{inc.time}</span>
              </button>
              {expanded === inc.id && (
                <div className="px-4 pb-4 pl-12 space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-gray-500">Duration</span>
                      <p className="text-xs text-white flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {inc.duration}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Affected Clients</span>
                      <p className="text-xs text-white mt-0.5">{inc.affected}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">ID</span>
                      <p className="text-xs text-white font-mono-data mt-0.5">{inc.id}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Root Cause</span>
                    <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{inc.rootCause}</p>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-success/5 border border-success/20 rounded-app">
                    <Shield className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-success font-medium">Advisory Impact Assessment</span>
                      <p className="text-xs text-gray-300 mt-0.5">{inc.advisory}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs text-success">Resolved</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
