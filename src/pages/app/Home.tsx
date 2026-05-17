import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle,
  ChevronRight, Activity, RefreshCw, Zap, Pause, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface Recommendation {
  id: string;
  title: string;
  summary: string;
  status: string;
  automation_status: string;
  created_at: string;
}

interface InvestorProfile {
  goal: string;
  time_horizon: string;
  risk_level: string;
  account_type: string;
}

const MOCK_PORTFOLIO = {
  value: 139172.99,
  dayChange: 892.40,
  dayChangePct: 0.64,
  allTimeGain: 21926.64,
  allTimeGainPct: 18.7,
};

const MOCK_ALLOCATIONS = [
  { label: 'Technology', pct: 17.7, color: 'bg-mint' },
  { label: 'Financials', pct: 12.3, color: 'bg-warning' },
  { label: 'Communication', pct: 8.0, color: 'bg-blue-400' },
  { label: 'Industrials', pct: 7.5, color: 'bg-orange-400' },
  { label: 'Healthcare', pct: 6.9, color: 'bg-success' },
  { label: 'Consumer', pct: 5.3, color: 'bg-pink-400' },
  { label: 'Energy & Matls', pct: 4.4, color: 'bg-red-400' },
  { label: 'Cash', pct: 6.2, color: 'bg-gray-500' },
];

function GoalLabel(g: string) {
  const map: Record<string, string> = {
    long_term_growth: 'Long-term growth',
    retirement: 'Retirement',
    house_fund: 'House fund',
    general_investing: 'General investing',
    income: 'Income generation',
  };
  return map[g] || g;
}

export default function Home() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const tier = profile?.subscription_tier || 'signal';
  const isManaged = tier === 'managed';
  const managedActive = profile?.managed_active;

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [{ data: recs }, { data: inv }] = await Promise.all([
        supabase.from('recommendations').select('*').eq('user_id', user!.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(3),
        supabase.from('investor_profiles').select('*').eq('user_id', user!.id).maybeSingle(),
      ]);
      setRecommendations(recs || []);
      setInvestorProfile(inv);
      setLoadingRecs(false);
    }
    load();
  }, [user]);

  const brokerConnected = profile?.brokerage_connected;
  const positive = MOCK_PORTFOLIO.dayChange >= 0;
  const exceptionCount = recommendations.filter(r => r.automation_status === 'exception_review').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-1">Good morning,</p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">{profile?.full_name?.split(' ')[0] || 'Investor'}</h1>
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-app border ${
            isManaged && managedActive
              ? 'bg-mint/5 border-mint/20 text-mint'
              : isManaged
              ? 'bg-warning/5 border-warning/20 text-warning'
              : 'bg-charcoal-lighter border-charcoal-border text-gray-400'
          }`}>
            {isManaged && managedActive ? <Zap className="w-3 h-3" /> : isManaged ? <Pause className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {isManaged && managedActive ? 'ReFi Managed — active' : isManaged ? 'ReFi Managed — paused' : 'ReFi Signal'}
          </div>
        </div>
      </div>

      {/* Portfolio value strip */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total portfolio value</p>
            <p className="text-3xl font-bold font-mono text-white">
              ${MOCK_PORTFOLIO.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`flex items-center gap-1 text-sm font-mono ${positive ? 'text-success' : 'text-error'}`}>
                {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {positive ? '+' : ''}${Math.abs(MOCK_PORTFOLIO.dayChange).toFixed(2)} ({positive ? '+' : ''}{MOCK_PORTFOLIO.dayChangePct}%)
              </span>
              <span className="text-xs text-gray-600">Today</span>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-sm font-mono text-success">
                +${MOCK_PORTFOLIO.allTimeGain.toLocaleString()} ({MOCK_PORTFOLIO.allTimeGainPct}%)
              </span>
              <span className="text-xs text-gray-600">All time</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!brokerConnected ? (
              <Link to="/app/account" className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-app px-3 py-2 text-xs text-warning hover:bg-warning/15 transition-colors">
                <AlertCircle className="w-3.5 h-3.5" />
                Connect your brokerage
                <ChevronRight className="w-3 h-3" />
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-success">
                <CheckCircle className="w-3.5 h-3.5" />
                {profile?.brokerage_name || 'Brokerage'} connected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Managed mode: automation status */}
      {isManaged && (
        <div className={`rounded-app-md p-4 mb-6 border ${
          managedActive ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {managedActive ? <Zap className="w-4 h-4 text-success" /> : <Pause className="w-4 h-4 text-warning" />}
              <div>
                <p className="text-xs font-medium text-white">
                  {managedActive ? 'Managed execution is active' : 'Managed execution is paused'}
                </p>
                <p className="text-xs text-gray-500">
                  {managedActive
                    ? 'Eligible recommendations submit automatically inside your approved guardrails.'
                    : 'No new orders are being submitted. Resume from the Automation Center.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {exceptionCount > 0 && (
                <button
                  onClick={() => navigate('/app/exceptions')}
                  className="flex items-center gap-1.5 text-xs text-warning border border-warning/30 rounded-app px-3 py-1.5 hover:bg-warning/10 transition-colors"
                >
                  <AlertCircle className="w-3 h-3" />
                  {exceptionCount} exception{exceptionCount > 1 ? 's' : ''}
                </button>
              )}
              <Link to="/app/automation" className="flex items-center gap-1 text-xs text-mint hover:text-mint-light transition-colors">
                Automation Center <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Signal mode: upgrade nudge */}
      {!isManaged && (
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4 mb-6 flex items-center gap-4">
          <div className="w-8 h-8 bg-mint/10 border border-mint/20 rounded-app flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-mint" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white">Upgrade to ReFi Managed</p>
            <p className="text-xs text-gray-500">Authorize automatic execution inside your approved guardrails. Assets stay at your broker.</p>
          </div>
          <Button size="sm" onClick={() => navigate('/app/subscription')} className="shrink-0 gap-1">
            Learn more <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          {/* Recommendations panel */}
          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-border">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Recommendations</h2>
                {recommendations.length > 0 && (
                  <span className="w-5 h-5 bg-mint text-charcoal rounded-full text-xs font-bold flex items-center justify-center">
                    {recommendations.length}
                  </span>
                )}
              </div>
              <Link to="/app/recommendations" className="text-xs text-mint hover:text-mint-light flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {loadingRecs ? (
              <div className="p-5 space-y-3">
                {[1,2].map(i => <div key={i} className="h-16 bg-charcoal-light rounded-app animate-pulse" />)}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-sm font-medium text-white mb-1">All caught up</p>
                <p className="text-xs text-gray-500">No pending recommendations. Your portfolio is on track.</p>
              </div>
            ) : (
              <div className="divide-y divide-charcoal-border">
                {recommendations.map(rec => {
                  const isException = rec.automation_status === 'exception_review';
                  return (
                    <Link
                      key={rec.id}
                      to={isException ? '/app/exceptions' : '/app/recommendations'}
                      className="flex items-start gap-3 p-5 hover:bg-charcoal-light/50 transition-colors group"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isException ? 'bg-warning' : 'bg-mint'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-mint transition-colors">{rec.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{rec.summary}</p>
                      </div>
                      <Badge variant={isException ? 'warning' : 'mint'}>
                        {isException ? 'Review' : isManaged ? 'Auto' : 'Review'}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Goal progress */}
          {investorProfile && (
            <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-mint" />
                  <h2 className="text-sm font-semibold text-white">Goal Progress</h2>
                </div>
                <Badge variant="info">{investorProfile.time_horizon}</Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{GoalLabel(investorProfile.goal)}</span>
                <span className="text-xs font-mono text-white">54% of target</span>
              </div>
              <div className="h-2 bg-charcoal-light rounded-full overflow-hidden mb-3">
                <div className="h-full bg-mint rounded-full" style={{ width: '54%' }} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-charcoal-light rounded-app p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Risk level</p>
                  <p className="text-sm font-semibold text-white capitalize">{investorProfile.risk_level}</p>
                </div>
                <div className="bg-charcoal-light rounded-app p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Account</p>
                  <p className="text-sm font-semibold text-white uppercase">{investorProfile.account_type?.replace('_', ' ')}</p>
                </div>
                <div className="bg-charcoal-light rounded-app p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Monthly</p>
                  <p className="text-sm font-semibold text-white">$500</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Allocation */}
          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Allocation</h2>
              <Link to="/app/portfolio" className="text-xs text-mint hover:text-mint-light">Details</Link>
            </div>
            <div className="space-y-2">
              {MOCK_ALLOCATIONS.map(a => (
                <div key={a.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{a.label}</span>
                    <span className="font-mono text-white">{a.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-charcoal-light rounded-full overflow-hidden">
                    <div className={`h-full ${a.color} rounded-full`} style={{ width: `${a.pct * 4}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
            <div className="px-5 py-4 border-b border-charcoal-border">
              <h2 className="text-sm font-semibold text-white">Quick access</h2>
            </div>
            <div className="divide-y divide-charcoal-border">
              {[
                ...(isManaged ? [{ to: '/app/automation', icon: Zap, label: 'Automation Center' }] : []),
                { to: '/app/strategy', icon: Target, label: 'Portfolio strategy' },
                { to: '/app/activity', icon: Activity, label: 'Recent activity' },
                { to: '/app/records', icon: Shield, label: 'Records' },
                { to: '/app/account', icon: RefreshCw, label: 'Account settings' },
              ].map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-charcoal-light/50 transition-colors group"
                >
                  <Icon className="w-4 h-4 text-gray-500 group-hover:text-mint transition-colors" />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Plan card */}
          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
            <p className="text-xs text-gray-500 mb-1">Your plan</p>
            <p className="text-sm font-semibold text-white mb-1">
              {isManaged ? 'ReFi Managed' : 'ReFi Signal'}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              {isManaged
                ? managedActive
                  ? 'Automatic execution inside your approved guardrails.'
                  : 'Managed execution is paused. Resume in Automation Center.'
                : 'Personalized recommendations. You review and act manually.'}
            </p>
            {!isManaged && (
              <button onClick={() => navigate('/app/subscription')} className="text-xs text-mint hover:text-mint-light transition-colors flex items-center gap-1">
                Upgrade to Managed <ChevronRight className="w-3 h-3" />
              </button>
            )}
            {isManaged && (
              <Link to="/app/automation" className="text-xs text-mint hover:text-mint-light transition-colors flex items-center gap-1">
                Manage automation <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
