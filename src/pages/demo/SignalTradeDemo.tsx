import { useState, useEffect, useCallback } from 'react';
import {
  Play, RotateCcw, CheckCircle, Cpu, Shield, User, Bell,
  TrendingUp, Clock, Eye, ThumbsUp, ThumbsDown, ArrowRight, Lock, Link2
} from 'lucide-react';

interface PipelineStep {
  id: number;
  label: string;
  detail: string;
  icon: typeof Cpu;
  duration: number;
  color: string;
  pauseForReview?: boolean;
}

const PIPELINE: PipelineStep[] = [
  { id: 1, label: 'Recommendation Generated', detail: 'Algorithm identifies: BUY 20 shares VXUS at $61.83 for Client #2103 based on international underweight', icon: TrendingUp, duration: 1200, color: 'text-mint' },
  { id: 2, label: 'Pre-flight Compliance Check', detail: 'Automated suitability verification: risk tolerance (Moderate-Aggressive), allocation limit check, disclosure status', icon: Shield, duration: 1000, color: 'text-blue-400' },
  { id: 3, label: 'zk-Proof Generated (Suitability)', detail: 'Groth16 proof confirms recommendation is suitable without revealing private client data. 288 bytes generated.', icon: Cpu, duration: 1500, color: 'text-orange-400' },
  { id: 4, label: 'Notification Delivered to Client', detail: 'Push notification + in-app alert sent. Recommendation queued in review panel with full rationale displayed.', icon: Bell, duration: 800, color: 'text-warning' },
  { id: 5, label: 'Awaiting Client Review', detail: 'Client reviews recommendation rationale, projected impact, and compliance attestation in their dashboard', icon: Eye, duration: 3000, color: 'text-warning', pauseForReview: true },
  { id: 6, label: 'Client Approves Execution', detail: 'Client confirms trade via authenticated action. Decision timestamp: 2026-05-04T14:35:22Z', icon: ThumbsUp, duration: 600, color: 'text-success' },
  { id: 7, label: 'Consent Attestation', detail: 'Client approval cryptographically attested. zk-proof of informed consent generated and published on-chain.', icon: Lock, duration: 1200, color: 'text-orange-400' },
  { id: 8, label: 'Chainlink Oracle Consensus', detail: '3/3 nodes verify: suitability proof valid + client consent proof valid. Dual attestation published.', icon: Link2, duration: 1000, color: 'text-mint' },
  { id: 9, label: 'Broker Order Submitted', detail: 'Market order routed to Fidelity via OAuth 2.0 PKCE. Order ID: ORD-2026-184321', icon: ArrowRight, duration: 700, color: 'text-success' },
  { id: 10, label: 'Order Filled', detail: 'BUY 20 VXUS @ $61.83. Fill latency: 52ms. Total: $1,236.60. Human-permissioned execution confirmed.', icon: CheckCircle, duration: 500, color: 'text-success' },
];

export default function SignalTradeDemo() {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepProgress, setStepProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showReviewPanel, setShowReviewPanel] = useState(false);

  const reset = useCallback(() => {
    setRunning(false);
    setCurrentStep(-1);
    setCompletedSteps([]);
    setStepProgress(0);
    setPaused(false);
    setShowReviewPanel(false);
  }, []);

  const runDemo = useCallback(() => {
    reset();
    setRunning(true);
    setCurrentStep(0);
  }, [reset]);

  const handleApprove = () => {
    setPaused(false);
    setShowReviewPanel(false);
    setCompletedSteps(prev => [...prev, currentStep]);
    setTimeout(() => setCurrentStep(prev => prev + 1), 200);
  };

  const handleReject = () => {
    setPaused(false);
    setShowReviewPanel(false);
    setRunning(false);
  };

  useEffect(() => {
    if (!running || currentStep < 0 || currentStep >= PIPELINE.length || paused) return;

    const step = PIPELINE[currentStep];

    if (step.pauseForReview) {
      setPaused(true);
      setShowReviewPanel(true);
      setStepProgress(100);
      return;
    }

    setStepProgress(0);
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
  }, [running, currentStep, paused]);

  const allComplete = completedSteps.length === PIPELINE.length;
  const rejected = !running && !allComplete && completedSteps.length > 0 && !paused;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-bold text-white">Human-Permissioned Execution</h1>
        </div>
        <p className="text-sm text-gray-400">
          ReFi Signal tier — Recommendations require explicit client approval before execution
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
              : 'bg-blue-500 text-white hover:bg-blue-400'
          }`}
        >
          <Play className="w-4 h-4" />
          {allComplete || rejected ? 'Run Again' : 'Start Demo'}
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
            <span className="text-xs text-success font-medium">Trade executed with client consent</span>
          </div>
        )}
        {rejected && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-error/10 border border-error/20 rounded-app">
            <ThumbsDown className="w-4 h-4 text-error" />
            <span className="text-xs text-error font-medium">Client declined — No trade executed</span>
          </div>
        )}
      </div>

      {/* Trade summary */}
      <div className="mb-6 p-4 bg-charcoal rounded-app-md border border-charcoal-border">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-gray-500">Action</span>
            <p className="text-white font-medium mt-0.5">BUY 20 VXUS</p>
          </div>
          <div>
            <span className="text-gray-500">Price</span>
            <p className="text-white font-mono-data mt-0.5">$61.83</p>
          </div>
          <div>
            <span className="text-gray-500">Total</span>
            <p className="text-white font-mono-data mt-0.5">$1,236.60</p>
          </div>
          <div>
            <span className="text-gray-500">Client</span>
            <p className="text-white mt-0.5">#2103</p>
          </div>
          <div>
            <span className="text-gray-500">Broker</span>
            <p className="text-white mt-0.5">Fidelity</p>
          </div>
          <div>
            <span className="text-gray-500">Trigger</span>
            <p className="text-white mt-0.5">International underweight</p>
          </div>
        </div>
      </div>

      {/* Client review panel (appears when paused) */}
      {showReviewPanel && (
        <div className="mb-6 p-5 bg-charcoal rounded-app-md border-2 border-warning/40 animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-warning" />
            <h3 className="text-sm font-semibold text-white">Client Review Required</h3>
            <Clock className="w-4 h-4 text-warning animate-pulse ml-auto" />
            <span className="text-xs text-warning animate-pulse">Awaiting response...</span>
          </div>

          <div className="bg-charcoal-deep rounded-app p-4 mb-4 border border-charcoal-border">
            <p className="text-sm text-white mb-3 font-medium">Recommendation: Buy 20 shares VXUS</p>
            <div className="space-y-2 text-xs text-gray-300">
              <p><span className="text-gray-500">Rationale:</span> Your international equity allocation is 2.8% below target. This purchase restores balance.</p>
              <p><span className="text-gray-500">Expected impact:</span> International allocation moves from 22.2% to 25.0% (target).</p>
              <p><span className="text-gray-500">Risk assessment:</span> Moderate — consistent with your risk profile.</p>
              <p><span className="text-gray-500">Compliance status:</span> <span className="text-success">Pre-verified via zk-proof</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-app text-sm font-medium hover:bg-success/80 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              Approve & Execute
            </button>
            <button
              onClick={handleReject}
              className="flex items-center gap-2 px-4 py-2 bg-error/20 text-error border border-error/40 rounded-app text-sm font-medium hover:bg-error/30 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              Decline
            </button>
            <span className="text-xs text-gray-500 ml-2">Simulating client decision point</span>
          </div>
        </div>
      )}

      {/* Pipeline */}
      <div className="space-y-1">
        {PIPELINE.map((step, index) => {
          const isActive = currentStep === index && !paused;
          const isPausedHere = currentStep === index && paused;
          const isComplete = completedSteps.includes(index);
          const isPending = !isActive && !isComplete && !isPausedHere;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`relative rounded-app-md border transition-all duration-300 overflow-hidden ${
                isActive
                  ? 'bg-charcoal border-blue-400/40 shadow-card'
                  : isPausedHere
                  ? 'bg-charcoal border-warning/40 shadow-card'
                  : isComplete
                  ? 'bg-charcoal/80 border-charcoal-border'
                  : 'bg-charcoal-deep/50 border-charcoal-border/50'
              }`}
            >
              {isActive && (
                <div
                  className="absolute inset-0 bg-blue-400/5 transition-all duration-100"
                  style={{ width: `${stepProgress}%` }}
                />
              )}

              <div className="relative flex items-center gap-3 px-4 py-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-400/20 border-2 border-blue-400'
                    : isPausedHere
                    ? 'bg-warning/20 border-2 border-warning animate-pulse'
                    : isComplete
                    ? 'bg-success/20 border border-success/40'
                    : 'bg-charcoal-lighter border border-charcoal-border'
                }`}>
                  {isComplete ? (
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  ) : isPausedHere ? (
                    <Clock className="w-3.5 h-3.5 text-warning" />
                  ) : isActive ? (
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  ) : (
                    <span className="text-xs text-gray-500 font-mono-data">{step.id}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? step.color : isPausedHere ? 'text-warning' : isComplete ? 'text-gray-500' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-medium transition-colors ${
                      isActive || isPausedHere ? 'text-white' : isComplete ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="text-xs text-blue-400 font-mono-data animate-pulse">processing...</span>
                    )}
                    {isPausedHere && (
                      <span className="text-xs text-warning font-mono-data animate-pulse">awaiting client...</span>
                    )}
                  </div>
                  {(isActive || isComplete || isPausedHere) && (
                    <p className={`text-xs mt-1 ${
                      isActive || isPausedHere ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {step.detail}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {isComplete && <span className="text-xs text-success font-mono-data">done</span>}
                  {isActive && <span className="text-xs text-blue-400 font-mono-data">{stepProgress}%</span>}
                  {isPausedHere && <span className="text-xs text-warning font-mono-data">paused</span>}
                  {isPending && <span className="text-xs text-gray-600">waiting</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion details */}
      {allComplete && (
        <div className="mt-6 p-4 bg-charcoal rounded-app-md border border-blue-400/20 animate-fadeIn">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Dual-Attestation Record
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Suitability Proof</span>
              <p className="text-mint font-mono-data mt-0.5">0x1b4c9d3e...d847a2b1</p>
            </div>
            <div>
              <span className="text-gray-500">Consent Proof</span>
              <p className="text-blue-400 font-mono-data mt-0.5">0x5e7f2a8d...c193b4e6</p>
            </div>
            <div>
              <span className="text-gray-500">Oracle Consensus</span>
              <p className="text-success font-mono-data mt-0.5">3/3 nodes</p>
            </div>
            <div>
              <span className="text-gray-500">Client Decision Time</span>
              <p className="text-white font-mono-data mt-0.5">Manual (demo)</p>
            </div>
            <div>
              <span className="text-gray-500">Proving System</span>
              <p className="text-white font-mono-data mt-0.5">Groth16 / BN254</p>
            </div>
            <div>
              <span className="text-gray-500">Proofs Generated</span>
              <p className="text-white font-mono-data mt-0.5">2 (suitability + consent)</p>
            </div>
            <div>
              <span className="text-gray-500">Human Involvement</span>
              <p className="text-blue-400 font-mono-data mt-0.5">CLIENT ONLY</p>
            </div>
            <div>
              <span className="text-gray-500">Staff Involvement</span>
              <p className="text-success font-mono-data mt-0.5">ZERO</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-charcoal-border">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">
                Client reviewed and approved execution. No ReFi staff involved in the advisory decision — satisfying Rule 203A-2(e) while preserving client agency.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
