import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Info, Shield, Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/Badge';

const HOLDINGS = [
  { name: 'Apple Inc.', symbol: 'AAPL', sector: 'Technology', shares: 62, avgCost: 172.40, price: 188.72, value: 11700.64, gain: 1011.84, gainPct: 9.47, weight: 8.4 },
  { name: 'Microsoft Corp.', symbol: 'MSFT', sector: 'Technology', shares: 20, avgCost: 378.50, price: 390.12, value: 7802.40, gain: 232.40, gainPct: 3.07, weight: 5.6 },
  { name: 'Palantir Technologies', symbol: 'PLTR', sector: 'Technology', shares: 210, avgCost: 21.44, price: 24.38, value: 5119.80, gain: 617.40, gainPct: 13.72, weight: 3.7 },
  { name: 'Alphabet Inc.', symbol: 'GOOG', sector: 'Communication', shares: 15, avgCost: 388.20, price: 394.80, value: 5922.00, gain: 99.00, gainPct: 1.70, weight: 4.2 },
  { name: 'Meta Platforms', symbol: 'META', sector: 'Communication', shares: 10, avgCost: 510.40, price: 528.60, value: 5286.00, gain: 182.00, gainPct: 3.57, weight: 3.8 },
  { name: 'JPMorgan Chase', symbol: 'JPM', sector: 'Financials', shares: 28, avgCost: 236.10, price: 247.80, value: 6938.40, gain: 327.60, gainPct: 4.96, weight: 5.0 },
  { name: 'Brown & Brown', symbol: 'BRO', sector: 'Financials', shares: 38, avgCost: 116.40, price: 122.80, value: 4666.40, gain: 243.20, gainPct: 5.50, weight: 3.3 },
  { name: 'Mastercard Inc.', symbol: 'MA', sector: 'Financials', shares: 12, avgCost: 448.20, price: 468.40, value: 5620.80, gain: 242.40, gainPct: 4.51, weight: 4.0 },
  { name: 'Amgen Inc.', symbol: 'AMGN', sector: 'Healthcare', shares: 18, avgCost: 298.40, price: 319.80, value: 5756.40, gain: 385.20, gainPct: 7.17, weight: 4.1 },
  { name: 'Johnson & Johnson', symbol: 'JNJ', sector: 'Healthcare', shares: 24, avgCost: 158.80, price: 162.40, value: 3897.60, gain: 86.40, gainPct: 2.27, weight: 2.8 },
  { name: 'Copart Inc.', symbol: 'CPRT', sector: 'Industrials', shares: 42, avgCost: 52.20, price: 56.80, value: 2385.60, gain: 193.20, gainPct: 8.81, weight: 1.7 },
  { name: 'Waste Management', symbol: 'WM', sector: 'Industrials', shares: 12, avgCost: 198.40, price: 210.60, value: 2527.20, gain: 146.40, gainPct: 6.15, weight: 1.8 },
  { name: 'EOG Resources', symbol: 'EOG', sector: 'Energy', shares: 22, avgCost: 118.60, price: 124.20, value: 2732.40, gain: 123.20, gainPct: 4.72, weight: 2.0 },
  { name: 'Procter & Gamble', symbol: 'PG', sector: 'Consumer Staples', shares: 26, avgCost: 158.20, price: 164.80, value: 4284.80, gain: 171.60, gainPct: 4.17, weight: 3.1 },
  { name: 'Ecolab Inc.', symbol: 'ECL', sector: 'Materials', shares: 14, avgCost: 228.40, price: 241.60, value: 3382.40, gain: 184.80, gainPct: 5.78, weight: 2.4 },
  { name: 'Ross Stores', symbol: 'ROST', sector: 'Consumer Disc.', shares: 20, avgCost: 148.60, price: 156.20, value: 3124.00, gain: 152.00, gainPct: 5.11, weight: 2.2 },
  { name: 'Vertiv Holdings', symbol: 'VRT', sector: 'Industrials', shares: 32, avgCost: 62.40, price: 71.80, value: 2297.60, gain: 300.80, gainPct: 15.06, weight: 1.6 },
  { name: 'Fastenal Company', symbol: 'FAST', sector: 'Industrials', shares: 48, avgCost: 64.80, price: 68.40, value: 3283.20, gain: 172.80, gainPct: 5.56, weight: 2.4 },
  { name: 'Cash', symbol: 'CASH', sector: 'Cash', shares: 1, avgCost: 8642.35, price: 8642.35, value: 8642.35, gain: 0, gainPct: 0, weight: 6.2 },
];

const TABS = ['Overview', 'Holdings', 'Performance', 'Risk', 'Managed Changes'];

const PERF_DATA = [
  { label: '1M', yours: 3.2, bench: 2.4 },
  { label: '3M', yours: 7.8, bench: 5.9 },
  { label: '6M', yours: 11.4, bench: 8.6 },
  { label: '1Y', yours: 16.8, bench: 13.2 },
  { label: 'All', yours: 18.6, bench: 14.1 },
];

const MANAGED_CHANGES = [
  {
    id: 'mc-001',
    title: 'Buy 15 AAPL — Rebalance to target weight',
    action: 'BUY',
    asset: 'AAPL',
    amount: '$2,826.30',
    shares: '15 shares @ $188.42',
    status: 'filled',
    broker_order_id: 'ORD-2026-00792',
    rec_id: 'Rebalance drift 2.1%',
    submitted_at: '2026-04-26T09:31:00Z',
    filled_at: '2026-04-26T09:31:52Z',
    impact: '+2.1% AAPL weight → target 8.5%',
  },
  {
    id: 'mc-002',
    title: 'Buy 10 JPM — Add financial sector exposure',
    action: 'BUY',
    asset: 'JPM',
    amount: '$2,478.00',
    shares: '10 shares @ $247.80',
    status: 'filled',
    broker_order_id: 'ORD-2026-00783',
    rec_id: 'New basket position',
    submitted_at: '2026-04-24T14:15:00Z',
    filled_at: '2026-04-24T14:15:41Z',
    impact: '+1.8% JPM weight → target 5.2%',
  },
  {
    id: 'mc-003',
    title: 'Buy 3 MSFT — Restore target allocation',
    action: 'BUY',
    asset: 'MSFT',
    amount: '$1,170.00',
    shares: '3 shares @ $390.00',
    status: 'filled',
    broker_order_id: 'ORD-2026-00841',
    rec_id: 'Drift rebalance 1.5%',
    submitted_at: '2026-05-01T10:22:00Z',
    filled_at: '2026-05-01T10:22:31Z',
    impact: '+1.5% MSFT weight → target 5.6%',
  },
  {
    id: 'mc-004',
    title: 'Buy 10 AMGN — Healthcare basket position',
    action: 'BUY',
    asset: 'AMGN',
    amount: '$3,198.00',
    shares: '10 shares @ $319.80',
    status: 'filled',
    broker_order_id: 'ORD-2026-00751',
    rec_id: 'New basket position',
    submitted_at: '2026-04-16T11:04:00Z',
    filled_at: '2026-04-16T11:04:38Z',
    impact: '+2.3% AMGN weight → target 4.5%',
  },
];

const GUARDRAILS = [
  { label: 'Max single order', value: '$2,000', status: 'ok' },
  { label: 'Max position size', value: '8% of portfolio', status: 'ok' },
  { label: 'Daily order limit', value: '4 orders', status: 'ok' },
  { label: 'Min cash reserve', value: '$2,500', current: '$2,412', status: 'warning' },
  { label: 'Daily loss pause', value: '2%', status: 'ok' },
  { label: 'Drawdown pause', value: '8%', status: 'ok' },
  { label: 'Market orders', value: 'Disabled', status: 'ok' },
  { label: 'Limit orders', value: 'Required', status: 'ok' },
];

export default function Portfolio() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [activePeriod, setActivePeriod] = useState('1Y');

  const isManaged = profile?.subscription_tier === 'managed';
  const availableTabs = isManaged ? TABS : TABS.filter(t => t !== 'Managed Changes');
  const totalValue = HOLDINGS.reduce((s, h) => s + h.value, 0);
  const totalGain = HOLDINGS.reduce((s, h) => s + h.gain, 0);


  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">Portfolio</h1>
            <p className="text-sm text-gray-500">Holdings, allocation, and performance overview</p>
          </div>
          {isManaged && (
            <div className="flex items-center gap-1.5 text-xs text-mint">
              <Zap className="w-3 h-3" /> Managed
            </div>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total value', value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, mono: true },
          { label: 'Total gain', value: `+$${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })} (+18.7%)`, mono: true, positive: true },
          { label: 'Risk level', value: 'Moderate', mono: false },
          { label: 'Positions', value: `${HOLDINGS.length - 1}`, mono: true },
        ].map(({ label, value, mono, positive }) => (
          <div key={label} className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-sm font-semibold ${mono ? 'font-mono' : ''} ${positive ? 'text-success' : 'text-white'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-charcoal-border overflow-x-auto scrollbar-thin">
        {availableTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab
                ? 'text-mint border-mint'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'Overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Sector allocation</h3>
            <div className="space-y-3">
              {[
                { label: 'Technology', pct: 17.7, color: 'bg-mint' },
                { label: 'Financials', pct: 12.3, color: 'bg-warning' },
                { label: 'Healthcare', pct: 6.9, color: 'bg-success' },
                { label: 'Communication', pct: 8.0, color: 'bg-blue-400' },
                { label: 'Industrials', pct: 7.5, color: 'bg-orange-400' },
                { label: 'Consumer', pct: 5.3, color: 'bg-pink-400' },
                { label: 'Energy & Materials', pct: 4.4, color: 'bg-red-400' },
                { label: 'Cash', pct: 6.2, color: 'bg-gray-500' },
              ].map(a => (
                <div key={a.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{a.label}</span>
                    <span className="font-mono text-white font-medium">{a.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-charcoal-light rounded-full overflow-hidden">
                    <div className={`h-full ${a.color} rounded-full transition-all`} style={{ width: `${a.pct * 3}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Portfolio summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Total invested', value: '$117,246.35' },
                { label: 'Market value', value: '$139,172.99' },
                { label: 'Total gain', value: '+$21,926.64', positive: true },
                { label: 'Total return', value: '+18.7%', positive: true },
                { label: "Today's change", value: '+$892.40 (+0.64%)', positive: true },
                { label: 'Cash available', value: '$8,642.35' },
                { label: 'Universe', value: 'US Equities only' },
              ].map(({ label, value, positive }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-charcoal-border last:border-0">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className={`text-sm font-mono font-medium ${positive ? 'text-success' : 'text-white'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guardrails module (managed users) */}
          {isManaged && (
            <div className="md:col-span-2 bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-mint" />
                <h3 className="text-sm font-semibold text-white">Active guardrails</h3>
                <Badge variant="mint">Policy v1</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GUARDRAILS.map(g => (
                  <div key={g.label} className={`bg-charcoal-light rounded-app p-3 border ${
                    g.status === 'warning' ? 'border-warning/30' : 'border-charcoal-border'
                  }`}>
                    <p className="text-xs text-gray-500 mb-0.5">{g.label}</p>
                    <p className="text-xs font-medium text-white">{g.value}</p>
                    {g.current && (
                      <p className="text-xs text-warning mt-0.5">Current: {g.current}</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Guardrails from your execution policy. Edit in the{' '}
                <button onClick={() => navigate('/app/automation')} className="text-mint hover:text-mint-light transition-colors">Automation Center</button>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Holdings */}
      {activeTab === 'Holdings' && (
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-charcoal-light border-b border-charcoal-border">
                  {['Symbol', 'Name', 'Sector', 'Shares', 'Avg Cost', 'Price', 'Value', 'Gain/Loss', 'Wt'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border">
                {HOLDINGS.map(h => (
                  <tr key={h.symbol} className="hover:bg-charcoal-light/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-semibold text-mint">{h.symbol}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white truncate max-w-[140px]">{h.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{h.sector}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-300">{h.shares}</td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-400">${h.avgCost.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-sm text-white">${h.price.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-sm text-white">${h.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-sm ${h.gain >= 0 ? 'text-success' : 'text-error'}`}>
                        {h.gain >= 0 ? '+' : ''}${h.gain.toFixed(2)} ({h.gain >= 0 ? '+' : ''}{h.gainPct.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-1.5 bg-charcoal-light rounded-full overflow-hidden">
                          <div className="h-full bg-mint rounded-full" style={{ width: `${h.weight * 8}%` }} />
                        </div>
                        <span className="font-mono text-xs text-gray-400">{h.weight}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance */}
      {activeTab === 'Performance' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {PERF_DATA.map(p => (
              <button
                key={p.label}
                onClick={() => setActivePeriod(p.label)}
                className={`px-3 py-1.5 rounded-app text-sm font-medium transition-colors ${
                  activePeriod === p.label ? 'bg-mint text-charcoal' : 'bg-charcoal-lighter border border-charcoal-border text-gray-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
            {(() => {
              const d = PERF_DATA.find(p => p.label === activePeriod) || PERF_DATA[3];
              return (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Your portfolio ({d.label})</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <span className="text-3xl font-bold font-mono text-success">+{d.yours}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Benchmark (S&P 500) ({d.label})</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                      <span className="text-3xl font-bold font-mono text-gray-300">+{d.bench}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            <p className="text-xs text-gray-600 mt-4 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Performance shown for illustrative purposes. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      )}

      {/* Risk */}
      {activeTab === 'Risk' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Risk level', value: 'Moderate', desc: 'US Equities basket positioned for balanced long-term growth with moderate volatility.', badge: 'warning' as const },
              { label: 'Max drift', value: '1.4% (AAPL)', desc: 'AAPL is 1.4% below target weight. Exceeds 2% threshold — rebalance recommendation generated.', badge: 'warning' as const },
            ].map(item => (
              <div key={item.label} className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <Badge variant={item.badge}>{item.value}</Badge>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Allocation vs. Target</h3>
            <div className="space-y-3">
              {[
                { label: 'Technology', current: 17.7, target: 19.1 },
                { label: 'Financials', current: 12.3, target: 12.3 },
                { label: 'Healthcare', current: 6.9, target: 8.5 },
                { label: 'Communication', current: 8.0, target: 8.0 },
                { label: 'Industrials', current: 7.5, target: 7.4 },
                { label: 'Consumer', current: 5.3, target: 6.3 },
                { label: 'Energy & Matls', current: 4.4, target: 5.0 },
                { label: 'Cash', current: 6.2, target: 6.2 },
              ].map(a => (
                <div key={a.label} className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 w-28 shrink-0">{a.label}</span>
                  <div className="flex-1 relative h-2 bg-charcoal-light rounded-full overflow-hidden">
                    <div className="absolute h-full bg-mint/40 rounded-full" style={{ width: `${a.target}%` }} />
                    <div className="absolute h-full bg-mint rounded-full" style={{ width: `${a.current}%` }} />
                  </div>
                  <div className="flex gap-3 text-xs font-mono w-24 shrink-0 justify-end">
                    <span className="text-gray-500">{a.target}%</span>
                    <span className="text-white">{a.current}%</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">Target shown in muted, current in bright.</p>
          </div>

          <div className="bg-warning/5 border border-warning/20 rounded-app-md p-4">
            <p className="text-xs text-warning font-medium mb-1">Risk reminder</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              All investments involve risk, including the possible loss of principal. The value of your portfolio can go down as well as up. Past performance is not a guarantee of future results.
            </p>
          </div>
        </div>
      )}

      {/* Managed Changes */}
      {activeTab === 'Managed Changes' && isManaged && (
        <div className="space-y-5">
          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4 flex items-start gap-3">
            <Zap className="w-4 h-4 text-mint shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-white mb-0.5">Automatic portfolio changes</p>
              <p className="text-xs text-gray-500">
                Orders submitted by ReFi Managed inside your approved execution policy. Each change links to its recommendation and broker order record.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {MANAGED_CHANGES.map(change => (
              <div key={change.id} className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-app flex items-center justify-center shrink-0 ${
                    change.status === 'filled' ? 'bg-success/10 border border-success/20' : 'bg-mint/10 border border-mint/20'
                  }`}>
                    {change.status === 'filled'
                      ? <CheckCircle className="w-4 h-4 text-success" />
                      : <Clock className="w-4 h-4 text-mint" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-sm font-medium text-white">{change.title}</h4>
                      <Badge variant={change.status === 'filled' ? 'success' : 'mint'}>
                        {change.status === 'filled' ? 'Filled' : 'Submitted'}
                      </Badge>
                      <Badge variant={change.action === 'BUY' ? 'success' : 'warning'}>{change.action}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                      {[
                        { label: 'Asset', value: change.asset },
                        { label: 'Amount', value: change.amount },
                        { label: 'Quantity', value: change.shares },
                        { label: 'Portfolio impact', value: change.impact },
                      ].map(item => (
                        <div key={item.label} className="bg-charcoal-light rounded-app p-2">
                          <p className="text-xs text-gray-600">{item.label}</p>
                          <p className="text-xs font-mono text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs">
                      <div>
                        <span className="text-gray-600">Broker order: </span>
                        <span className="font-mono text-gray-500">{change.broker_order_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Recommendation: </span>
                        <span className="font-mono text-gray-500">{change.rec_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Submitted: </span>
                        <span className="font-mono text-gray-500">{new Date(change.submitted_at).toLocaleString()}</span>
                      </div>
                      {change.filled_at && (
                        <div>
                          <span className="text-gray-600">Filled: </span>
                          <span className="font-mono text-gray-500">{new Date(change.filled_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Guardrails summary in managed changes */}
          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-mint" />
              <h3 className="text-sm font-semibold text-white">Execution guardrails</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {GUARDRAILS.map(g => (
                <div key={g.label} className={`bg-charcoal-light rounded-app p-2.5 border ${
                  g.status === 'warning' ? 'border-warning/30' : 'border-charcoal-border'
                }`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {g.status === 'ok'
                      ? <CheckCircle className="w-3 h-3 text-success" />
                      : <AlertCircle className="w-3 h-3 text-warning" />
                    }
                    <p className="text-xs text-gray-500">{g.label}</p>
                  </div>
                  <p className="text-xs font-medium text-white">{g.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-400">Managed execution:</span> All orders shown above were submitted automatically by ReFi software inside your approved execution policy. No human selected or modified these trades. Each order is linked to its source recommendation and permanently recorded.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
