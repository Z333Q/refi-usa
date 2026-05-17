import { useState, useEffect } from 'react';
import { User, Target, Building2, Shield, Bell, HelpCircle, ChevronRight, CheckCircle, AlertCircle, CreditCard as Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface InvestorProfile {
  goal: string;
  time_horizon: string;
  risk_level: string;
  account_type: string;
}

const GOAL_LABELS: Record<string, string> = {
  long_term_growth: 'Long-term growth',
  retirement: 'Retirement',
  house_fund: 'House fund',
  general_investing: 'General investing',
  income: 'Income generation',
};

const ACCOUNT_LABELS: Record<string, string> = {
  taxable: 'Individual taxable brokerage',
  roth_ira: 'Roth IRA',
  traditional_ira: 'Traditional IRA',
};

const BROKERAGES = ['Alpaca', 'Schwab', 'Fidelity', 'TD Ameritrade', 'Interactive Brokers'];

const TABS = [
  { id: 'profile', label: 'Personal info', icon: User },
  { id: 'goals', label: 'Goals & risk profile', icon: Target },
  { id: 'brokerage', label: 'Linked brokerage', icon: Building2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

export default function Account() {
  const { profile, user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [mgmtMode, setMgmtMode] = useState(profile?.management_mode || 'review');
  const [brokerageConnecting, setBrokerageConnecting] = useState(false);
  const [savingMode, setSavingMode] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('investor_profiles').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setInvestorProfile(data));
  }, [user]);

  async function connectBrokerage(name: string) {
    if (!user) return;
    setBrokerageConnecting(true);
    await new Promise(r => setTimeout(r, 1500));
    await supabase.from('profiles').update({ brokerage_connected: true, brokerage_name: name }).eq('id', user.id);
    await supabase.from('activity_events').insert({
      user_id: user.id,
      event_type: 'brokerage_connected',
      title: 'Brokerage connected',
      description: `Your ${name} account has been linked. ReFi can now read account data and submit approved portfolio instructions.`,
      status: 'completed',
    });
    await refreshProfile();
    setBrokerageConnecting(false);
  }

  async function saveMgmtMode() {
    if (!user) return;
    setSavingMode(true);
    await supabase.from('profiles').update({ management_mode: mgmtMode }).eq('id', user.id);
    await refreshProfile();
    setSavingMode(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-1">Account</h1>
        <p className="text-sm text-gray-500">Profile, goals, brokerage, and security settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="md:w-52 shrink-0">
          <nav className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-charcoal-border last:border-0 ${
                    activeTab === tab.id
                      ? 'bg-mint/10 text-mint border-l-2 border-mint pl-[14px]'
                      : 'text-gray-400 hover:bg-charcoal-light hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {activeTab !== tab.id && <ChevronRight className="w-3 h-3 ml-auto text-gray-600" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Personal info */}
          {activeTab === 'profile' && (
            <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6">
              <h2 className="text-base font-semibold text-white mb-6">Personal information</h2>
              <div className="space-y-4">
                {[
                  { label: 'Full name', value: profile?.full_name || '—' },
                  { label: 'Email address', value: profile?.email || user?.email || '—' },
                  { label: 'Account ID', value: user?.id?.slice(0, 8).toUpperCase() || '—' },
                  { label: 'Account created', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start py-3 border-b border-charcoal-border last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white text-right">{value}</span>
                      {label === 'Full name' && (
                        <button className="text-gray-600 hover:text-mint transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4">
                To update your legal name or address, contact support. These changes require identity verification for regulatory purposes.
              </p>
            </div>
          )}

          {/* Goals & risk */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6">
                <h2 className="text-base font-semibold text-white mb-4">Your investor profile</h2>
                {investorProfile ? (
                  <div className="space-y-3">
                    {[
                      { label: 'Primary goal', value: GOAL_LABELS[investorProfile.goal] || investorProfile.goal },
                      { label: 'Time horizon', value: investorProfile.time_horizon },
                      { label: 'Risk level', value: investorProfile.risk_level },
                      { label: 'Account type', value: ACCOUNT_LABELS[investorProfile.account_type] || investorProfile.account_type },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-2 border-b border-charcoal-border last:border-0">
                        <span className="text-sm text-gray-500">{label}</span>
                        <span className="text-sm font-medium text-white capitalize">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Profile not loaded.</p>
                )}
                <Button variant="secondary" size="sm" className="mt-4">Update my profile</Button>
              </div>

              <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6">
                <h2 className="text-base font-semibold text-white mb-2">Management mode</h2>
                <p className="text-sm text-gray-500 mb-5">Choose how your portfolio is managed.</p>
                <div className="space-y-3 mb-5">
                  {[
                    {
                      id: 'review',
                      label: 'Review before we trade',
                      desc: 'You receive personalized recommendations. You approve each change before it is sent to your brokerage.',
                    },
                    {
                      id: 'auto',
                      label: 'Automatically manage my portfolio',
                      desc: 'Your portfolio is managed automatically within the goals, account settings, and risk guardrails you approved.',
                    },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setMgmtMode(mode.id)}
                      className={`w-full flex items-start gap-3 p-4 rounded-app border text-left transition-all ${
                        mgmtMode === mode.id
                          ? 'border-mint bg-mint/5'
                          : 'border-charcoal-border hover:border-gray-500'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                        mgmtMode === mode.id ? 'border-mint' : 'border-gray-600'
                      }`}>
                        {mgmtMode === mode.id && <div className="w-2 h-2 bg-mint rounded-full" />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${mgmtMode === mode.id ? 'text-white' : 'text-gray-300'}`}>{mode.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{mode.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <Button size="sm" onClick={saveMgmtMode} loading={savingMode}>Save preference</Button>
              </div>
            </div>
          )}

          {/* Brokerage */}
          {activeTab === 'brokerage' && (
            <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6">
              <h2 className="text-base font-semibold text-white mb-2">Linked brokerage</h2>
              <p className="text-sm text-gray-500 mb-6">Your account stays at your brokerage. ReFi reads account data and sends approved portfolio instructions according to your settings.</p>

              {profile?.brokerage_connected ? (
                <div>
                  <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 rounded-app-md mb-4">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">{profile.brokerage_name} connected</p>
                      <p className="text-xs text-gray-500">Last synced: Today at 9:14 AM</p>
                    </div>
                    <Badge variant="success" className="ml-auto">Active</Badge>
                  </div>
                  <div className="space-y-2 text-xs text-gray-500">
                    <p>ReFi can: Read account balances, holdings, and transaction history.</p>
                    <p>ReFi can: Submit approved trade orders on your behalf.</p>
                    <p>ReFi cannot: Withdraw funds, transfer assets, or change account settings.</p>
                  </div>
                  <Button variant="danger" size="sm" className="mt-4">Disconnect brokerage</Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 p-4 bg-warning/5 border border-warning/20 rounded-app-md mb-6">
                    <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">No brokerage connected</p>
                      <p className="text-xs text-gray-500">Connect your brokerage to activate portfolio management.</p>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-3">Connect a brokerage</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {BROKERAGES.map(name => (
                      <button
                        key={name}
                        onClick={() => connectBrokerage(name)}
                        disabled={brokerageConnecting}
                        className="flex items-center gap-3 p-4 bg-charcoal-light border border-charcoal-border rounded-app hover:border-mint/50 hover:bg-mint/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Building2 className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-300">{name}</span>
                        {brokerageConnecting && <span className="ml-auto w-3 h-3 border border-mint border-t-transparent rounded-full animate-spin" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6">
              <h2 className="text-base font-semibold text-white mb-6">Security settings</h2>
              <div className="space-y-4">
                {[
                  { label: 'Two-factor authentication', status: 'Not enabled', action: 'Enable', variant: 'secondary' as const, desc: 'Add an extra layer of security to your account.' },
                  { label: 'Password', status: 'Last changed: Never', action: 'Change password', variant: 'secondary' as const, desc: 'Use a strong, unique password.' },
                  { label: 'Active sessions', status: '1 active session', action: 'View all', variant: 'tertiary' as const, desc: 'Manage where you are signed in.' },
                ].map(item => (
                  <div key={item.label} className="flex items-start justify-between py-4 border-b border-charcoal-border last:border-0 gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.status}</p>
                    </div>
                    <Button variant={item.variant} size="sm" className="shrink-0">{item.action}</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6">
              <h2 className="text-base font-semibold text-white mb-6">Notification preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'New recommendations', desc: 'When a new recommendation is ready for your review.', on: true },
                  { label: 'Recommendation approved', desc: 'When an approved order is submitted to your brokerage.', on: true },
                  { label: 'Brokerage connection issues', desc: 'When your brokerage connection needs attention.', on: true },
                  { label: 'Portfolio updates', desc: 'Weekly summary of your portfolio performance.', on: false },
                  { label: 'New documents', desc: 'When new statements or disclosures are available.', on: true },
                ].map(item => (
                  <div key={item.label} className="flex items-start justify-between py-3 border-b border-charcoal-border last:border-0 gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      className={`w-10 h-5 rounded-full transition-all shrink-0 relative ${item.on ? 'bg-mint' : 'bg-charcoal-border'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.on ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6">
                <h2 className="text-base font-semibold text-white mb-4">How can we help?</h2>
                <div className="space-y-2">
                  {[
                    { q: 'How are my recommendations generated?', a: 'Recommendations are generated by software models using your personal investor profile — goals, time horizon, risk tolerance, and current holdings. No human adviser is involved in creating individual recommendations.' },
                    { q: 'What does ReFi do with my brokerage access?', a: 'We use your brokerage connection to read your current holdings and submit approved trade orders. We cannot withdraw funds, transfer assets, or change brokerage account settings.' },
                    { q: 'Is my money safe with ReFi?', a: 'Your assets are held at your connected brokerage, not by ReFi. We are a non-custodial adviser. Your brokerage account is in your name and protected by your brokerage\'s SIPC coverage where applicable.' },
                    { q: 'How do I update my investor profile?', a: 'Go to Goals & Risk Profile and click "Update my profile." Significant profile changes may pause active recommendations until a new recommendation is generated based on your updated profile.' },
                  ].map(({ q, a }) => (
                    <details key={q} className="group border border-charcoal-border rounded-app overflow-hidden">
                      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-charcoal-light/40 transition-colors list-none">
                        <span className="text-sm font-medium text-white">{q}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="px-4 pb-4 pt-1">
                        <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
              <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-6">
                <h3 className="text-sm font-semibold text-white mb-2">Contact support</h3>
                <p className="text-xs text-gray-500 mb-4">Our support team can help with technical issues, account setup, and understanding how the product works. Support staff cannot provide personalized investment advice outside the product.</p>
                <Button variant="secondary" size="sm">Email support</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
