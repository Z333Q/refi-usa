import { useState } from 'react';
import { FileDown, CheckCircle, ChevronDown, ChevronRight, Shield, Cpu } from 'lucide-react';

const EXPORT_PACKAGES = [
  { id: 1, name: 'Client Advisory Records', desc: 'All recommendations, suitability analyses, and execution records', records: '184,320', format: 'JSON + PDF', regulation: 'Rule 204-2(a)(7)' },
  { id: 2, name: 'Compliance Attestations', desc: 'Complete zk-proof attestation history with verification data', records: '14,832', format: 'JSON + On-chain refs', regulation: 'Rule 204-2(a)(16)' },
  { id: 3, name: 'Client Communications', desc: 'Support interactions with boundary enforcement audit trail', records: '14,832', format: 'JSON + PDF', regulation: 'Rule 204-2(a)(7)' },
  { id: 4, name: 'Internet Adviser Evidence', desc: 'Rule 203A-2(e) compliance proof package', records: '8,760', format: 'JSON + PDF', regulation: 'Rule 203A-2(e)' },
  { id: 5, name: 'Brokerage Execution Log', desc: 'Order routing, fills, and execution quality metrics', records: '92,461', format: 'FIX + JSON', regulation: 'Rule 204-2(a)(3)' },
  { id: 6, name: 'Privacy Compliance', desc: 'Reg S-P safeguarding evidence and data access logs', records: '2,847', format: 'JSON + PDF', regulation: 'Reg S-P' },
  { id: 7, name: 'Algorithm Audit Trail', desc: 'Decision logs, model versions, and parameter history', records: '52,190', format: 'JSON', regulation: 'Rule 204-2(a)(16)' },
];

const VERIFICATION_PIPELINE = [
  { step: 1, label: 'Retrieve Merkle Root', desc: 'Fetch current state root from on-chain verifier contract' },
  { step: 2, label: 'Generate Inclusion Proof', desc: 'Build Merkle path for selected record set (32-level tree)' },
  { step: 3, label: 'Verify Proof Integrity', desc: 'Validate Poseidon hash chain from leaf to root' },
  { step: 4, label: 'Cross-reference Attestation', desc: 'Match record hashes against published Chainlink attestations' },
  { step: 5, label: 'Validate Temporal Ordering', desc: 'Confirm chronological consistency via block timestamps' },
  { step: 6, label: 'Export Verification Bundle', desc: 'Package proof data with independent verification instructions' },
  { step: 7, label: 'Generate Examiner Report', desc: 'Produce human-readable summary with technical appendix' },
];

export default function ExaminerExport() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Examiner Export</h1>
        <p className="text-sm text-gray-400 mt-1">SEC examination record packages with cryptographic verification</p>
      </div>

      {/* Export packages */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <FileDown className="w-4 h-4 text-mint" />
          Export Packages
        </h2>
        <div className="space-y-2">
          {EXPORT_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{pkg.name}</span>
                <span className="text-xs text-mint font-mono-data">{pkg.regulation}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{pkg.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-500">Records: <span className="text-white font-mono-data">{pkg.records}</span></span>
                  <span className="text-gray-500">Format: <span className="text-white">{pkg.format}</span></span>
                </div>
                <button className="text-xs text-mint hover:text-mint-light transition-colors font-medium flex items-center gap-1">
                  <FileDown className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification pipeline */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-mint" />
          zk Verification Pipeline
        </h2>
        <div className="space-y-1">
          {VERIFICATION_PIPELINE.map((step) => (
            <div key={step.step} className="bg-charcoal rounded-app border border-charcoal-border overflow-hidden">
              <button
                onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-charcoal-light/50 transition-colors"
              >
                {expandedStep === step.step ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                )}
                <div className="w-5 h-5 bg-mint/20 border border-mint/40 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs text-mint font-bold">{step.step}</span>
                </div>
                <span className="text-sm text-white flex-1">{step.label}</span>
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
              </button>
              {expandedStep === step.step && (
                <div className="px-4 pb-3 pl-16">
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Proof parameters */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-mint" />
          Proof System Parameters
        </h2>
        <div className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Proving System</span>
              <p className="text-white font-mono-data mt-0.5">Groth16</p>
            </div>
            <div>
              <span className="text-gray-500">Curve</span>
              <p className="text-white font-mono-data mt-0.5">BN254</p>
            </div>
            <div>
              <span className="text-gray-500">Hash Function</span>
              <p className="text-white font-mono-data mt-0.5">Poseidon</p>
            </div>
            <div>
              <span className="text-gray-500">Merkle Depth</span>
              <p className="text-white font-mono-data mt-0.5">32 levels</p>
            </div>
            <div>
              <span className="text-gray-500">Proof Size</span>
              <p className="text-white font-mono-data mt-0.5">288 bytes</p>
            </div>
            <div>
              <span className="text-gray-500">Verification Time</span>
              <p className="text-white font-mono-data mt-0.5">&lt;50ms</p>
            </div>
            <div>
              <span className="text-gray-500">Security Level</span>
              <p className="text-white font-mono-data mt-0.5">254-bit</p>
            </div>
            <div>
              <span className="text-gray-500">Trusted Setup</span>
              <p className="text-white font-mono-data mt-0.5">Powers of Tau</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification instructions */}
      <div className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
        <h3 className="text-sm font-semibold text-white mb-2">Independent Verification Instructions</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-3">
          SEC examiners can independently verify all records without relying on ReFi systems:
        </p>
        <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside">
          <li>Obtain the Merkle root from the public Ethereum contract at the published address</li>
          <li>Use the exported verification bundle to reconstruct the Poseidon hash path</li>
          <li>Confirm leaf hash matches the record data using standard cryptographic libraries</li>
          <li>Validate the Chainlink attestation signatures against known oracle public keys</li>
          <li>Cross-reference block timestamps for temporal integrity</li>
        </ol>
      </div>
    </div>
  );
}
