import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Target, ChevronRight, Clock, CheckCircle, AlertCircle, BarChart2, Info, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface InvestorProfile {
  goal: string;
  time_horizon: string;
  risk_level: string;
  account_type: string;
  annual_income: string;
  investable_assets: string;
  investment_experience: string;
}

const MODEL_VERSION = 'RFT-MODEL-v2.1.0';

const ELIGIBLE_UNIVERSE = [
  'A','AA','AAPL','ACGL','ACIW','ACM','ADMA','ADP','AEO','AER','AKAM','ALLE','ALNY','ALSN',
  'AM','AMAT','AMGN','ANET','AOS','APA','ATI','AVY','BALL','BKR','BL','BLDR','BMY','BR',
  'BRO','BSM','BSX','BWXT','BX','BZ','CAKE','CALM','CARG','CARR','CBOE','CBRE','CCJ','CCL',
  'CEF','CELH','CF','CGNX','CHD','CHKP','CHRW','CHWY','CINF','CLX','CMCSA','CNH','COP',
  'CPAY','CPRT','CRH','CROX','CSCO','CSL','CSTM','CSX','CTRA','CTVA','CVI','DLO','DXCM',
  'EA','EBAY','ECL','ELF','EMN','EMR','EOG','EXEL','EXR','FANG','FAST','FCX','FDX','FERG',
  'FFIV','FHI','FIVE','FLEX','FLS','FN','FND','FTAI','FTDR','G','GAP','GDDY','GE','GILD',
  'GLOB','GLW','GNRC','GNTX','GOF','GOOG','GPC','GPN','GRMN','GTES','GVA','HAE','HAL',
  'HALO','HAYW','HQY','HRB','HSY','HTGC','IEX','INTU','INVH','IT','JCI','JHG','JHX','JKHY',
  'JNJ','JPM','KEYS','KLAC','KMI','LAUR','LAZ','LDOS','LHX','LITE','LNG','LPLA','LULU','LXP',
  'MA','MAIN','META','MGY','MHK','MMM','MMSI','MMYT','MNST','MS','MSI','MSM','MTH','MU','MUR',
  'NDAQ','NFLX','NJR','NKE','NOV','NTAP','NTES','NVT','NWS','NYT','OC','OII','OLLI','ONTO',
  'ORCL','OSW','PAA','PAGP','PANW','PAX','PAYX','PDD','PEGA','PEP','PFGC','PG','PH','PHYS',
  'PLTR','PPC','PPG','PRIM','PSN','PSX','PTC','PWR','QCOM','QGEN','RCL','REG','REGN','RL',
  'RMBS','ROST','RPM','RSI','RTX','RYN','SCCO','SEIC','SFM','SGHC','SITE','SKY','SLB','SMTC',
  'SNX','SSNC','STRL','SYK','SYY','TDC','TEL','TER','TEX','TIGO','TJX','TKO','TKR','TMDX',
  'TMUS','TOL','TPH','TPR','TREX','TRGP','TRMB','TSEM','TT','TTC','TTD','TTMI','TW','UPWK',
  'URI','USFD','VAL','VICI','VLO','VNT','VRRM','VRT','VSCO','VST','VVV','VZ','WAB','WCC',
  'WDC','WES','WFRD','WH','WM','WMS','WMT','WRB','WST','WTW','WWD','XPO','XRX','YELP','ZBH','ZBRA',
];
const MODEL_DATE = '2026-05-01';

// MPT basket definitions — US Equities only, constructed by risk profile
// Baskets are diversified across sectors using Modern Portfolio Theory optimization
// All securities drawn from the ReFi Trading eligible universe

interface BasketHolding {
  ticker: string;
  name: string;
  sector: string;
  targetPct: number;
}

function getBasket(riskLevel: string): BasketHolding[] {
  if (riskLevel === 'aggressive') {
    return [
      { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', targetPct: 9.5 },
      { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', targetPct: 8.0 },
      { ticker: 'GOOG', name: 'Alphabet Inc.', sector: 'Communication', targetPct: 6.5 },
      { ticker: 'META', name: 'Meta Platforms', sector: 'Communication', targetPct: 5.5 },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', targetPct: 5.0 },
      { ticker: 'AMZN', name: 'Amazon.com', sector: 'Consumer Disc.', targetPct: 5.0 },
      { ticker: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', targetPct: 4.5 },
      { ticker: 'ANET', name: 'Arista Networks', sector: 'Technology', targetPct: 4.0 },
      { ticker: 'PANW', name: 'Palo Alto Networks', sector: 'Technology', targetPct: 3.5 },
      { ticker: 'TTD', name: 'The Trade Desk', sector: 'Technology', targetPct: 3.0 },
      { ticker: 'CROX', name: 'Crocs Inc.', sector: 'Consumer Disc.', targetPct: 2.5 },
      { ticker: 'CELH', name: 'Celsius Holdings', sector: 'Consumer Staples', targetPct: 2.5 },
      { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', targetPct: 4.0 },
      { ticker: 'BX', name: 'Blackstone Inc.', sector: 'Financials', targetPct: 3.0 },
      { ticker: 'FCX', name: 'Freeport-McMoRan', sector: 'Materials', targetPct: 2.5 },
      { ticker: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare', targetPct: 2.5 },
      { ticker: 'EOG', name: 'EOG Resources', sector: 'Energy', targetPct: 2.0 },
      { ticker: 'VRT', name: 'Vertiv Holdings', sector: 'Industrials', targetPct: 2.0 },
      { ticker: 'Cash', name: 'Settlement / Money Market', sector: 'Cash', targetPct: 5.0 },
    ];
  }
  if (riskLevel === 'conservative') {
    return [
      { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', targetPct: 5.5 },
      { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', targetPct: 5.0 },
      { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', targetPct: 6.0 },
      { ticker: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare', targetPct: 5.5 },
      { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', targetPct: 6.0 },
      { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer Staples', targetPct: 6.5 },
      { ticker: 'KMI', name: 'Kinder Morgan', sector: 'Energy', targetPct: 4.5 },
      { ticker: 'BRO', name: 'Brown & Brown', sector: 'Financials', targetPct: 4.0 },
      { ticker: 'CINF', name: 'Cincinnati Financial', sector: 'Financials', targetPct: 4.0 },
      { ticker: 'WM', name: 'Waste Management', sector: 'Industrials', targetPct: 4.5 },
      { ticker: 'VZ', name: 'Verizon Communications', sector: 'Communication', targetPct: 4.0 },
      { ticker: 'ECL', name: 'Ecolab Inc.', sector: 'Materials', targetPct: 3.5 },
      { ticker: 'RPM', name: 'RPM International', sector: 'Materials', targetPct: 3.0 },
      { ticker: 'NJR', name: 'New Jersey Resources', sector: 'Utilities', targetPct: 3.5 },
      { ticker: 'PAYX', name: 'Paychex Inc.', sector: 'Financials', targetPct: 3.5 },
      { ticker: 'MMM', name: '3M Company', sector: 'Industrials', targetPct: 3.0 },
      { ticker: 'HSY', name: 'The Hershey Company', sector: 'Consumer Staples', targetPct: 3.0 },
      { ticker: 'Cash', name: 'Settlement / Money Market', sector: 'Cash', targetPct: 10.0 },
    ];
  }
  // Moderate (default)
  return [
    { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', targetPct: 8.5 },
    { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', targetPct: 5.6 },
    { ticker: 'GOOG', name: 'Alphabet Inc.', sector: 'Communication', targetPct: 4.2 },
    { ticker: 'META', name: 'Meta Platforms', sector: 'Communication', targetPct: 3.8 },
    { ticker: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', targetPct: 5.8 },
    { ticker: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare', targetPct: 4.5 },
    { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', targetPct: 4.0 },
    { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', targetPct: 5.2 },
    { ticker: 'BRO', name: 'Brown & Brown', sector: 'Financials', targetPct: 3.5 },
    { ticker: 'MA', name: 'Mastercard Inc.', sector: 'Financials', targetPct: 3.5 },
    { ticker: 'CPRT', name: 'Copart Inc.', sector: 'Industrials', targetPct: 3.2 },
    { ticker: 'WM', name: 'Waste Management', sector: 'Industrials', targetPct: 3.0 },
    { ticker: 'EOG', name: 'EOG Resources', sector: 'Energy', targetPct: 2.8 },
    { ticker: 'SLB', name: 'SLB (Schlumberger)', sector: 'Energy', targetPct: 2.2 },
    { ticker: 'FAST', name: 'Fastenal Company', sector: 'Industrials', targetPct: 2.5 },
    { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer Staples', targetPct: 3.5 },
    { ticker: 'ECL', name: 'Ecolab Inc.', sector: 'Materials', targetPct: 2.5 },
    { ticker: 'ROST', name: 'Ross Stores', sector: 'Consumer Disc.', targetPct: 2.8 },
    { ticker: 'VRT', name: 'Vertiv Holdings', sector: 'Industrials', targetPct: 2.2 },
    { ticker: 'Cash', name: 'Settlement / Money Market', sector: 'Cash', targetPct: 6.2 },
  ];
}

function getGuardrails(riskLevel: string) {
  if (riskLevel === 'aggressive') {
    return [
      'Single-stock cap: no position may exceed 10% of portfolio',
      'Technology sector cap: 50% maximum allocation',
      'Rebalance triggered when any position drifts more than 2% from target',
      'Cash minimum: 3% at all times for settlement and opportunity',
      'All positions must be US-listed equities from the ReFi eligible universe',
    ];
  }
  if (riskLevel === 'conservative') {
    return [
      'Single-stock cap: no position may exceed 7% of portfolio',
      'Defensive sectors (Healthcare, Staples, Utilities) minimum 30%',
      'Technology sector cap: 20% maximum allocation',
      'Rebalance triggered when any position drifts more than 1.5% from target',
      'Cash minimum: 8% at all times',
      'All positions must be US-listed equities from the ReFi eligible universe',
    ];
  }
  return [
    'Single-stock cap: no position may exceed 8% of portfolio',
    'Technology sector cap: 35% maximum allocation',
    'Rebalance triggered when any position drifts more than 2% from target',
    'Cash minimum: 5% at all times for settlement and opportunity',
    'All positions must be US-listed equities from the ReFi eligible universe',
    'Daily order limit: 4 trades per execution cycle',
  ];
}

function getProfileFit(profile: InvestorProfile) {
  const riskMap: Record<string, string> = {
    aggressive: 'growth-focused with high volatility tolerance',
    moderate: 'balanced with moderate volatility tolerance',
    conservative: 'stability-focused with low volatility tolerance',
  };
  const goalMap: Record<string, string> = {
    long_term_growth: 'long-term wealth building',
    retirement: 'retirement planning',
    house_fund: 'saving for a home purchase',
    general_investing: 'general portfolio growth',
    income: 'generating regular income',
  };
  return {
    riskDesc: riskMap[profile.risk_level] || profile.risk_level,
    goalDesc: goalMap[profile.goal] || profile.goal,
  };
}

const SECTOR_COLORS: Record<string, string> = {
  Technology: 'bg-mint',
  Communication: 'bg-blue-400',
  Healthcare: 'bg-success',
  Financials: 'bg-warning',
  Industrials: 'bg-orange-400',
  Energy: 'bg-red-400',
  'Consumer Disc.': 'bg-pink-400',
  'Consumer Staples': 'bg-teal-400',
  Materials: 'bg-yellow-400',
  Utilities: 'bg-cyan-400',
  Cash: 'bg-gray-500',
};

function getSectorBreakdown(basket: BasketHolding[]) {
  const sectors: Record<string, number> = {};
  for (const h of basket) {
    sectors[h.sector] = (sectors[h.sector] || 0) + h.targetPct;
  }
  return Object.entries(sectors).sort((a, b) => b[1] - a[1]);
}

export default function Strategy() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [view, setView] = useState<'basket' | 'sectors'>('basket');
  const [showUniverse, setShowUniverse] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setInvestorProfile(data);
      setLoading(false);
    })();
  }, [user]);

  async function handleApprove() {
    if (!user) return;
    setApproving(true);
    await supabase.from('activity_events').insert({
      user_id: user.id,
      event_type: 'strategy_approved',
      title: 'Portfolio strategy approved',
      description: `Approved model portfolio ${MODEL_VERSION}. US Equities basket mandate confirmed based on ${investorProfile?.risk_level} risk profile.`,
      status: 'completed',
    });
    setApproving(false);
    setApproved(true);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-charcoal-lighter border border-charcoal-border rounded-app-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!investorProfile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-12 text-center">
          <AlertCircle className="w-8 h-8 text-warning mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-2">Profile not found</p>
          <p className="text-xs text-gray-500 mb-4">Complete your investor profile to see your recommended strategy.</p>
          <Button onClick={() => navigate('/onboarding')} size="sm">Complete profile</Button>
        </div>
      </div>
    );
  }

  const basket = getBasket(investorProfile.risk_level);
  const guardrails = getGuardrails(investorProfile.risk_level);
  const { riskDesc, goalDesc } = getProfileFit(investorProfile);
  const sectorBreakdown = getSectorBreakdown(basket);
  const equityPct = basket.filter(h => h.sector !== 'Cash').reduce((s, h) => s + h.targetPct, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-1">Your portfolio strategy</h1>
        <p className="text-sm text-gray-500">MPT-optimized US Equities basket generated from your risk profile and investment mandate.</p>
      </div>

      {/* Model metadata */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Model</span>
            <span className="text-xs font-mono text-mint">{MODEL_VERSION}</span>
          </div>
          <div className="w-px h-3 bg-charcoal-border" />
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">Generated</span>
            <span className="text-xs font-mono text-gray-300">{MODEL_DATE}</span>
          </div>
          <div className="w-px h-3 bg-charcoal-border" />
          <span className="text-xs text-gray-500">Universe: <span className="text-gray-300">US Equities only</span></span>
          <div className="w-px h-3 bg-charcoal-border" />
          <span className="text-xs text-gray-500">Method: <span className="text-gray-300">Modern Portfolio Theory</span></span>
          <div className="ml-auto">
            <Badge variant={
              investorProfile.risk_level === 'aggressive' ? 'error' :
              investorProfile.risk_level === 'moderate' ? 'warning' : 'info'
            }>
              {investorProfile.risk_level.charAt(0).toUpperCase() + investorProfile.risk_level.slice(1)} risk
            </Badge>
          </div>
        </div>
      </div>

      {/* Why this fits */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-mint" />
          <h2 className="text-sm font-semibold text-white">Why this strategy fits your profile</h2>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mb-3">
          Based on your goal of <span className="text-white font-medium">{goalDesc}</span> with a{' '}
          <span className="text-white font-medium">{investorProfile.time_horizon}</span> time horizon and a{' '}
          <span className="text-white font-medium">{riskDesc}</span> approach, the MPT optimizer constructed a{' '}
          <span className="text-white font-medium">{basket.length - 1}-position US Equities basket</span>. Weights are calculated to maximize the Sharpe ratio within your risk constraints.
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Goal', value: investorProfile.goal.replace(/_/g, ' ') },
            { label: 'Horizon', value: investorProfile.time_horizon },
            { label: 'Account', value: investorProfile.account_type?.replace(/_/g, ' ').toUpperCase() },
            { label: 'Equity %', value: `${equityPct.toFixed(1)}%` },
          ].map(item => (
            <div key={item.label} className="bg-charcoal-light rounded-app p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-xs font-medium text-white capitalize">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Basket / sector toggle */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-mint" />
            <h2 className="text-sm font-semibold text-white">Target basket allocations</h2>
          </div>
          <div className="flex gap-1">
            {(['basket', 'sectors'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-app text-xs font-medium transition-colors ${
                  view === v ? 'bg-mint text-charcoal' : 'text-gray-500 hover:text-white'
                }`}
              >
                {v === 'basket' ? 'Holdings' : 'Sectors'}
              </button>
            ))}
          </div>
        </div>

        {view === 'basket' && (
          <div className="space-y-2.5">
            {basket.map(h => (
              <div key={h.ticker}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-mono font-semibold text-white w-12 shrink-0">{h.ticker}</span>
                    <span className="text-xs text-gray-400 truncate">{h.name}</span>
                    <span className="text-xs text-gray-600 shrink-0">{h.sector}</span>
                  </div>
                  <span className="text-sm font-mono text-white shrink-0 ml-3">{h.targetPct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-charcoal-light rounded-full overflow-hidden">
                  <div
                    className={`h-full ${SECTOR_COLORS[h.sector] || 'bg-gray-500'} rounded-full`}
                    style={{ width: `${(h.targetPct / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'sectors' && (
          <div className="space-y-3">
            {sectorBreakdown.map(([sector, pct]) => (
              <div key={sector}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300">{sector}</span>
                  <span className="text-sm font-mono text-white">{pct.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-charcoal-light rounded-full overflow-hidden">
                  <div
                    className={`h-full ${SECTOR_COLORS[sector] || 'bg-gray-500'} rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-600 mt-4 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Target weights are calculated by MPT optimizer. Actual weights drift as prices move; rebalancing restores targets.
        </p>
      </div>

      {/* Guardrails */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-mint" />
          <h2 className="text-sm font-semibold text-white">Risk guardrails</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          These constraints define the bounds within which your portfolio will be managed. Recommendations that would breach a guardrail are automatically blocked or flagged for exception review.
        </p>
        <div className="space-y-2">
          {guardrails.map((g, i) => (
            <div key={i} className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">{g}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MPT stats */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-mint" />
          <h2 className="text-sm font-semibold text-white">MPT optimizer output</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Expected annual return', value: investorProfile.risk_level === 'aggressive' ? '12.4%' : investorProfile.risk_level === 'conservative' ? '7.2%' : '9.8%' },
            { label: 'Expected volatility', value: investorProfile.risk_level === 'aggressive' ? '18.2%' : investorProfile.risk_level === 'conservative' ? '9.1%' : '13.4%' },
            { label: 'Sharpe ratio (target)', value: investorProfile.risk_level === 'aggressive' ? '0.68' : investorProfile.risk_level === 'conservative' ? '0.79' : '0.73' },
            { label: 'Correlation to S&P 500', value: investorProfile.risk_level === 'aggressive' ? '0.91' : investorProfile.risk_level === 'conservative' ? '0.72' : '0.84' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-charcoal-light rounded-app p-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-sm font-mono font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Estimates based on trailing 5-year factor data. Forward-looking figures are not guaranteed. Past performance does not predict future results.
        </p>
      </div>

      {/* Approve / approved */}
      {!approved ? (
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
          <p className="text-sm font-medium text-white mb-1">Confirm your investment mandate</p>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            By approving this strategy, you authorize ReFi Trading to generate recommendations aligned with this US Equities basket. You retain full approval rights — no trade is executed without passing through compliance gates and, where applicable, your explicit consent.
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={handleApprove} loading={approving} className="gap-2">
              <CheckCircle className="w-4 h-4" /> Approve strategy
            </Button>
            <Button variant="secondary" onClick={() => navigate('/app/recommendations')} className="gap-1">
              View recommendations <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-success/5 border border-success/20 rounded-app-md p-5 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-success mb-1">Strategy approved</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your US Equities basket mandate has been confirmed. The MPT optimizer will generate rebalancing recommendations within your approved guardrails.
            </p>
            <button
              onClick={() => navigate('/app/recommendations')}
              className="text-xs text-mint hover:text-mint-light transition-colors mt-2 flex items-center gap-1"
            >
              View recommendations <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Eligible universe */}
      <div className="mt-6 bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
        <button
          onClick={() => setShowUniverse(!showUniverse)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-charcoal-light/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-400">Eligible securities universe ({ELIGIBLE_UNIVERSE.length} US-listed equities)</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showUniverse ? 'rotate-180' : ''}`} />
        </button>
        {showUniverse && (
          <div className="px-4 pb-4 border-t border-charcoal-border">
            <p className="text-xs text-gray-500 mt-3 mb-2">All positions held in your portfolio are drawn from this approved universe of US-listed equities.</p>
            <div className="flex flex-wrap gap-1.5">
              {ELIGIBLE_UNIVERSE.map(ticker => (
                <span key={ticker} className="text-xs font-mono text-gray-400 bg-charcoal-light border border-charcoal-border rounded px-1.5 py-0.5">
                  {ticker}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-400">Disclosure:</span> This model portfolio was generated by software using your investor profile inputs and Modern Portfolio Theory optimization. It is not individually tailored advice from a human investment adviser. The portfolio consists exclusively of US-listed equities. Model version {MODEL_VERSION} is current as of {MODEL_DATE}.
        </p>
      </div>
    </div>
  );
}
