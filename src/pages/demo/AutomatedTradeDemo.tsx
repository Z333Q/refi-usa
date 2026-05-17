import { useState, useEffect, useCallback } from 'react';
import {
  Play, RotateCcw, CheckCircle, Cpu, Link2, Shield, Zap,
  TrendingUp, ArrowRight, Lock
} from 'lucide-react';

interface PipelineStep {
  id: number;
  label: string;
  detail: string;
  icon: typeof Cpu;
  duration: number;
  color: string;
}

const PIPELINE: PipelineStep[] = [
  { id: 1, label: 'Recommendation Generated', detail: 'Algorithm identifies: BUY 15 shares VTI at $278.42 for Client #2841 based on rebalancing drift', icon: TrendingUp, duration: 1200, color: 'text-mint' },
  { id: 2, label: 'Execution Policy Check', detail: 'Validating against client-approved automation rules: max order $10,000, ETF-only, no leveraged products', icon: Shield, duration: 1000, color: 'text-blue-400' },
  { id: 3, label: 'Suitability Verification', detail: 'Confirming recommendation aligns with risk tolerance (Moderate), time horizon (15yr), and investment objectives', icon: CheckCircle, duration: 900, color: 'text-blue-400' },
  { id: 4, label: 'Concentration Limit Gate', detail: 'Post-trade VTI allocation: 34.2% (limit: 40%). Diversification constraint satisfied.', icon: Shield, duration: 800, color: 'text-blue-400' },
  { id: 5, label: 'zk-Witness Generation', detail: 'Constructing private witness from client profile, portfolio state, and recommendation without exposing PII', icon: Cpu, duration: 1400, color: 'text-orange-400' },
  { id: 6, label: 'Groth16 Proof Generation', detail: 'Generating 288-byte zk-SNARK proof over BN254 curve. R1CS constraints: 847. Proving time: 1.2s', icon: Cpu, duration: 1800, color: 'text-orange-400' },
  { id: 7, label: 'On-chain Verification', detail: 'Verifier contract validates proof against public inputs. Gas cost: 0. Verification time: 34ms', icon: Link2, duration: 800, color: 'text-mint' },
  { id: 8, label: 'Chainlink Oracle Consensus', detail: '3/3 nodes attest compliance. Node Alpha: 340ms, Node Beta: 287ms, Node Gamma: 412ms', icon: Link2, duration: 1200, color: 'text-mint' },
  { id: 9, label: 'Attestation Published', detail: 'Immutable compliance proof stored on-chain. Proof hash: 0x7a3f8b2c...e921d4f7', icon: Lock, duration: 600, color: 'text-mint' },
  { id: 10, label: 'Broker Order Submitted', detail: 'Market order routed to Charles Schwab via OAuth 2.0 PKCE. Order ID: ORD-2026-184320', icon: Zap, duration: 700, color: 'text-success' },
  { id: 11, label: 'Order Filled', detail: 'BUY 15 VTI @ $278.42. Fill latency: 48ms. Total: $4,176.30. Non-custodial execution confirmed.', icon: CheckCircle, duration: 500, color: 'text-success' },
];

export default function AutomatedTradeDemo() {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepProgress, setStepProgress] = useState(0);

  const reset = useCallback(() => {
    setRunning(false);
    setCurrentStep(-1);
    setCompletedSteps([]);
    setStepProgress(0);
  }, []);

  const runDemo = useCallback(() => {
    reset();
    setRunning(true);
    setCurrentStep(0);
  }, [reset]);

  useEffect(() => {
    if (!running || currentStep < 0 || currentStep >= PIPELINE.length) return;

    setStepProgress(0);
    const step = PIPELINE[currentStep];
    const progressInterval = setInterval(() => {
      setStepProgress(prev => Math.min(prev + 2, 100));
    }, step.duration / 50);

    const timer = setTimeout(() => {
      clearInterval(progressInterval);
      setStepProgress(100);
      setCompletedSteps(prev => [...prev, currentStep]);
      if (currentStep < PIPELINE.length - 1) {
        setTimeout(() => setCurrentStep(prev => prev + 1), 200);
      } else {
        setRunning(false);
      }
    }, step.duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [running, currentStep]);

  const allComplete = completedSteps.length === PIPELINE.length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-mint" />
          <h1 className="text-xl font-bold text-white">Automated Trade Execution</h1>
        </div>
        <p className="text-sm text-gray-400">
          ReFi Managed tier — Fully automated execution through the Chainlink Automated Compliance Engine (ACE) atomic gate
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={runDemo}
          disabled={running}
          className={`flex items-center gap-2 px-4 py-2 rounded-app text-sm font-medium transition-all ${
            running
              ? 'bg-charcoal-lighter text-gray-500 cursor-not-allowed'
              : 'bg-mint text-charcoal hover:bg-mint-light'
          }`}
        >
          <Play className="w-4 h-4" />
          {allComplete ? 'Run Again' : 'Start Demo'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-app text-sm font-medium text-gray-400 hover:text-white border border-charcoal-border hover:border-charcoal-lighter transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        {allComplete && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-app">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-success font-medium">Trade executed successfully — Zero human involvement</span>
          </div>
        )}
      </div>

      {/* Trade summary card */}
      <div className="mb-6 p-4 bg-charcoal rounded-app-md border border-charcoal-border">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-gray-500">Action</span>
            <p className="text-white font-medium mt-0.5">BUY 15 VTI</p>
          </div>
          <div>
            <span className="text-gray-500">Price</span>
            <p className="text-white font-mono-data mt-0.5">$278.42</p>
          </div>
          <div>
            <span className="text-gray-500">Total</span>
            <p className="text-white font-mono-data mt-0.5">$4,176.30</p>
          </div>
          <div>
            <span className="text-gray-500">Client</span>
            <p className="text-white mt-0.5">#2841</p>
          </div>
          <div>
            <span className="text-gray-500">Broker</span>
            <p className="text-white mt-0.5">Charles Schwab</p>
          </div>
          <div>
            <span className="text-gray-500">Trigger</span>
            <p className="text-white mt-0.5">Rebalancing drift (2.1%)</p>
          </div>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="space-y-1">
        {PIPELINE.map((step, index) => {
          const isActive = currentStep === index;
          const isComplete = completedSteps.includes(index);
          const isPending = !isActive && !isComplete;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`relative rounded-app-md border transition-all duration-300 overflow-hidden ${
                isActive
                  ? 'bg-charcoal border-mint/40 shadow-card'
                  : isComplete
                  ? 'bg-charcoal/80 border-charcoal-border'
                  : 'bg-charcoal-deep/50 border-charcoal-border/50'
              }`}
            >
              {/* Progress bar background */}
              {isActive && (
                <div
                  className="absolute inset-0 bg-mint/5 transition-all duration-100"
                  style={{ width: `${stepProgress}%` }}
                />
              )}

              <div className="relative flex items-center gap-3 px-4 py-3">
                {/* Step indicator */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isActive
                    ? 'bg-mint/20 border-2 border-mint'
                    : isComplete
                    ? 'bg-success/20 border border-success/40'
                    : 'bg-charcoal-lighter border border-charcoal-border'
                }`}>
                  {isComplete ? (
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  ) : isActive ? (
                    <div className="w-2 h-2 bg-mint rounded-full animate-pulse" />
                  ) : (
                    <span className="text-xs text-gray-500 font-mono-data">{step.id}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? step.color : isComplete ? 'text-gray-500' : 'text-gray-600'}`} />
                    <span className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : isComplete ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="text-xs text-mint font-mono-data animate-pulse">processing...</span>
                    )}
                  </div>
                  {(isActive || isComplete) && (
                    <p className={`text-xs mt-1 transition-all duration-300 ${
                      isActive ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {step.detail}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="shrink-0">
                  {isComplete && (
                    <span className="text-xs text-success font-mono-data">done</span>
                  )}
                  {isActive && (
                    <span className="text-xs text-mint font-mono-data">{stepProgress}%</span>
                  )}
                  {isPending && (
                    <span className="text-xs text-gray-600">waiting</span>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < PIPELINE.length - 1 && (
                <div className="absolute -bottom-1 left-[30px] w-px h-2 bg-charcoal-border z-10" />
              )}
            </div>
          );
        })}
      </div>

      {/* Proof details (shown after completion) */}
      {allComplete && (
        <div className="mt-6 p-4 bg-charcoal rounded-app-md border border-mint/20 animate-fadeIn">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-mint" />
            Compliance Attestation Record
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Proof Hash</span>
              <p className="text-mint font-mono-data mt-0.5">0x7a3f8b2c...e921d4f7</p>
            </div>
            <div>
              <span className="text-gray-500">Tx Hash</span>
              <p className="text-gray-300 font-mono-data mt-0.5">0xabc123...def456</p>
            </div>
            <div>
              <span className="text-gray-500">Oracle Consensus</span>
              <p className="text-success font-mono-data mt-0.5">3/3 nodes</p>
            </div>
            <div>
              <span className="text-gray-500">Total Latency</span>
              <p className="text-white font-mono-data mt-0.5">8.4 seconds</p>
            </div>
            <div>
              <span className="text-gray-500">Proving System</span>
              <p className="text-white font-mono-data mt-0.5">Groth16 / BN254</p>
            </div>
            <div>
              <span className="text-gray-500">Proof Size</span>
              <p className="text-white font-mono-data mt-0.5">288 bytes</p>
            </div>
            <div>
              <span className="text-gray-500">Human Involvement</span>
              <p className="text-success font-mono-data mt-0.5">ZERO</p>
            </div>
            <div>
              <span className="text-gray-500">Compliance Status</span>
              <p className="text-success font-mono-data mt-0.5">VERIFIED</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-charcoal-border">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">
                This trade was generated, validated, proven, attested, and executed entirely by algorithm — satisfying Rule 203A-2(e) Internet-only advisory requirement.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
