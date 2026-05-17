import { useState } from 'react';
import { CheckCircle, Cpu, Link2, Shield, Zap, ChevronDown, ChevronRight } from 'lucide-react';

const ORACLE_NODES = [
  { id: 'node-1', name: 'Chainlink Node Alpha', status: 'active', lastResponse: '340ms', attestations: 14832 },
  { id: 'node-2', name: 'Chainlink Node Beta', status: 'active', lastResponse: '287ms', attestations: 14831 },
  { id: 'node-3', name: 'Chainlink Node Gamma', status: 'active', lastResponse: '412ms', attestations: 14830 },
];

const ZK_PIPELINE = [
  { stage: 1, label: 'Input Collection', desc: 'Gather client profile, recommendation, portfolio state, and execution policy parameters', status: 'complete' },
  { stage: 2, label: 'Witness Generation', desc: 'Construct private witness from sensitive client data without exposing PII', status: 'complete' },
  { stage: 3, label: 'Circuit Execution', desc: 'Evaluate R1CS constraints: suitability, concentration, policy boundary, disclosure', status: 'complete' },
  { stage: 4, label: 'Proof Generation', desc: 'Groth16 prover generates 288-byte proof over BN254 curve (254-bit security)', status: 'complete' },
  { stage: 5, label: 'On-chain Verification', desc: 'Verifier contract validates proof against public inputs in <50ms', status: 'complete' },
  { stage: 6, label: 'Attestation Published', desc: 'Chainlink nodes reach consensus and publish immutable compliance attestation', status: 'complete' },
];

const COMPLIANCE_GATES = [
  { id: 'gate-1', name: 'Profile Completeness', rule: 'All required fields populated and verified', passRate: '100%', lastCheck: '2s ago' },
  { id: 'gate-2', name: 'Suitability Verification', rule: 'Recommendation aligns with risk tolerance and objectives', passRate: '99.7%', lastCheck: '2s ago' },
  { id: 'gate-3', name: 'Execution Policy Boundary', rule: 'Trade within user-approved automation parameters', passRate: '99.9%', lastCheck: '2s ago' },
  { id: 'gate-4', name: 'Concentration Limit', rule: 'Position size within diversification constraints', passRate: '99.4%', lastCheck: '2s ago' },
  { id: 'gate-5', name: 'Disclosure Acknowledgment', rule: 'Client has signed all applicable disclosures', passRate: '100%', lastCheck: '2s ago' },
  { id: 'gate-6', name: 'Human Non-Involvement', rule: 'Zero human discretion in advice generation or execution', passRate: '100%', lastCheck: '2s ago' },
];

const ATTESTATIONS = [
  { time: '14:32:01', type: 'Trade Execution', client: 'Client #2841', proofHash: '0x7a3f8b2c...e921d4f7', txHash: '0xabc123...def456', verified: true },
  { time: '14:31:45', type: 'Suitability Check', client: 'Client #2839', proofHash: '0x1b4c9d3e...d847a2b1', txHash: '0x789abc...123def', verified: true },
  { time: '14:31:12', type: 'Trade Execution', client: 'Client #2835', proofHash: '0x9e2d4f1a...f103c8e6', txHash: '0xdef456...abc789', verified: true },
  { time: '14:30:58', type: 'Policy Validation', client: 'Client #2841', proofHash: '0x4f8a7b6c...b276d9e3', txHash: '0x456789...abcdef', verified: true },
  { time: '14:30:30', type: 'Trade Execution', client: 'Client #2827', proofHash: '0xc3d1e5f2...a459b7c8', txHash: '0x123456...789abc', verified: true },
];

export default function ComplianceEngine() {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Automated Compliance Engine</h1>
        <p className="text-sm text-gray-400 mt-1">Chainlink Oracle Network + zk-SNARK Proof Pipeline</p>
      </div>

      {/* Oracle nodes */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-mint" />
          Chainlink Oracle Network
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ORACLE_NODES.map((node) => (
            <div key={node.id} className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white">{node.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Response</span>
                  <p className="text-white font-mono-data">{node.lastResponse}</p>
                </div>
                <div>
                  <span className="text-gray-500">Attestations</span>
                  <p className="text-white font-mono-data">{node.attestations.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* zk Pipeline */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-mint" />
          zk-SNARK Proof Pipeline
        </h2>
        <div className="space-y-1">
          {ZK_PIPELINE.map((step) => (
            <div key={step.stage} className="bg-charcoal rounded-app border border-charcoal-border overflow-hidden">
              <button
                onClick={() => setExpandedStage(expandedStage === step.stage ? null : step.stage)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-charcoal-light/50 transition-colors"
              >
                {expandedStage === step.stage ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                )}
                <div className="w-5 h-5 bg-success/20 border border-success/40 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs text-success font-bold">{step.stage}</span>
                </div>
                <span className="text-sm text-white flex-1">{step.label}</span>
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
              </button>
              {expandedStage === step.stage && (
                <div className="px-4 pb-3 pl-16">
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 px-4 py-2.5 bg-charcoal-light/50 rounded-app border border-charcoal-border">
          <span className="text-xs text-gray-500">Proving system:</span>
          <span className="text-xs text-white font-mono-data">Groth16</span>
          <span className="text-xs text-gray-500">Curve:</span>
          <span className="text-xs text-white font-mono-data">BN254</span>
          <span className="text-xs text-gray-500">Security:</span>
          <span className="text-xs text-white font-mono-data">254-bit</span>
          <span className="text-xs text-gray-500">Proof size:</span>
          <span className="text-xs text-white font-mono-data">288 bytes</span>
        </div>
      </div>

      {/* Compliance gates */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-mint" />
          Automated Compliance Gates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPLIANCE_GATES.map((gate) => (
            <div key={gate.id} className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{gate.name}</span>
                <Zap className="w-3.5 h-3.5 text-mint" />
              </div>
              <p className="text-xs text-gray-400 mb-3">{gate.rule}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-success font-mono-data">{gate.passRate} pass</span>
                <span className="text-gray-500">{gate.lastCheck}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent attestations */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Recent Attestations</h2>
        <div className="bg-charcoal rounded-app-md border border-charcoal-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-charcoal-border">
                <th className="text-left text-gray-500 font-medium px-4 py-2">Time</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Type</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Client</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Proof Hash</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Tx Hash</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {ATTESTATIONS.map((row, i) => (
                <tr key={i} className="border-b border-charcoal-border/50 last:border-0">
                  <td className="px-4 py-2 text-gray-400 font-mono-data">{row.time}</td>
                  <td className="px-4 py-2 text-white">{row.type}</td>
                  <td className="px-4 py-2 text-gray-300">{row.client}</td>
                  <td className="px-4 py-2 text-mint font-mono-data">{row.proofHash}</td>
                  <td className="px-4 py-2 text-gray-400 font-mono-data">{row.txHash}</td>
                  <td className="px-4 py-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
