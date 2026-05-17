import { useState } from 'react';
import { Link2, CheckCircle, ArrowUpRight, ArrowDownRight, Shield } from 'lucide-react';

const CONNECTIONS = [
  { name: 'Charles Schwab', status: 'active', accounts: 1247, lastSync: '2s ago', version: 'OAuth 2.0 PKCE' },
  { name: 'Fidelity', status: 'active', accounts: 892, lastSync: '5s ago', version: 'OAuth 2.0 PKCE' },
  { name: 'Interactive Brokers', status: 'active', accounts: 456, lastSync: '3s ago', version: 'FIX 4.4' },
  { name: 'TD Ameritrade', status: 'active', accounts: 252, lastSync: '4s ago', version: 'OAuth 2.0 PKCE' },
];

const ORDERS = [
  { time: '14:32:01', client: '#2841', symbol: 'VTI', side: 'BUY', qty: 15, price: '$278.42', latency: '48ms', status: 'filled' },
  { time: '14:31:45', client: '#2839', symbol: 'VXUS', side: 'BUY', qty: 22, price: '$61.83', latency: '52ms', status: 'filled' },
  { time: '14:31:12', client: '#2835', symbol: 'BND', side: 'SELL', qty: 30, price: '$72.15', latency: '41ms', status: 'filled' },
  { time: '14:30:58', client: '#2841', symbol: 'SCHD', side: 'BUY', qty: 8, price: '$82.67', latency: '55ms', status: 'filled' },
  { time: '14:30:30', client: '#2827', symbol: 'VTI', side: 'BUY', qty: 12, price: '$278.38', latency: '47ms', status: 'filled' },
  { time: '14:30:01', client: '#2819', symbol: 'VXUS', side: 'SELL', qty: 18, price: '$61.79', latency: '63ms', status: 'filled' },
];

const METRICS = [
  { label: 'Avg Fill Latency', value: '51ms' },
  { label: 'Fill Rate', value: '99.8%' },
  { label: 'Orders Today', value: '1,247' },
  { label: 'Rejected', value: '3' },
];

type Tab = 'connections' | 'orders' | 'metrics';

export default function BrokerOperations() {
  const [tab, setTab] = useState<Tab>('connections');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Broker Operations</h1>
        <p className="text-sm text-gray-400 mt-1">Non-custodial brokerage connectivity and order flow monitoring</p>
      </div>

      {/* Non-custodial notice */}
      <div className="flex items-center gap-3 p-4 mb-6 rounded-app-md bg-mint/5 border border-mint/20">
        <Shield className="w-5 h-5 text-mint shrink-0" />
        <div>
          <p className="text-sm font-medium text-mint">Non-custodial Model</p>
          <p className="text-xs text-gray-400 mt-0.5">ReFi never holds client funds. All trades executed directly in client brokerage accounts via authorized API connections.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-charcoal-border pb-0">
        {([['connections', 'Connections'], ['orders', 'Order Flow'], ['metrics', 'Execution Metrics']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'border-error text-white' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CONNECTIONS.map((conn) => (
            <div key={conn.name} className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white">{conn.name}</span>
                </div>
                <Link2 className="w-4 h-4 text-gray-500" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Accounts</span>
                  <p className="text-white font-mono-data">{conn.accounts.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Sync</span>
                  <p className="text-white font-mono-data">{conn.lastSync}</p>
                </div>
                <div>
                  <span className="text-gray-500">Protocol</span>
                  <p className="text-white font-mono-data text-[10px]">{conn.version}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="bg-charcoal rounded-app-md border border-charcoal-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-charcoal-border">
                <th className="text-left text-gray-500 font-medium px-4 py-2">Time</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Client</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Symbol</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Side</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Qty</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Price</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Latency</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((order, i) => (
                <tr key={i} className="border-b border-charcoal-border/50 last:border-0">
                  <td className="px-4 py-2 text-gray-400 font-mono-data">{order.time}</td>
                  <td className="px-4 py-2 text-gray-300">{order.client}</td>
                  <td className="px-4 py-2 text-white font-medium">{order.symbol}</td>
                  <td className="px-4 py-2">
                    <span className={`flex items-center gap-1 ${order.side === 'BUY' ? 'text-success' : 'text-error'}`}>
                      {order.side === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {order.side}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-white font-mono-data">{order.qty}</td>
                  <td className="px-4 py-2 text-white font-mono-data">{order.price}</td>
                  <td className="px-4 py-2 text-gray-400 font-mono-data">{order.latency}</td>
                  <td className="px-4 py-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'metrics' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {METRICS.map(({ label, value }) => (
            <div key={label} className="bg-charcoal rounded-app-md border border-charcoal-border p-4">
              <span className="text-xs text-gray-500">{label}</span>
              <p className="text-2xl font-bold text-white font-mono-data mt-2">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
