import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PieChart, BellRing, Activity, FileText, User,
  TrendingUp, Menu, X, LogOut, ChevronRight, Target, Shield, FlaskConical,
  Zap, AlertCircle, MessageSquare, Lock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const BASE_NAV = [
  { to: '/app', end: true, icon: LayoutDashboard, label: 'Home', managed: false },
  { to: '/app/portfolio', icon: PieChart, label: 'Portfolio', managed: false },
  { to: '/app/strategy', icon: Target, label: 'Strategy', managed: false },
  { to: '/app/recommendations', icon: BellRing, label: 'Recommendations', managed: false },
  { to: '/app/activity', icon: Activity, label: 'Activity', managed: false },
  { to: '/app/records', icon: Shield, label: 'Records', managed: false },
  { to: '/app/documents', icon: FileText, label: 'Documents', managed: false },
  { to: '/app/support', icon: MessageSquare, label: 'Support', managed: false },
  { to: '/app/account', icon: User, label: 'Account', managed: false },
];

const MANAGED_NAV = [
  { to: '/app', end: true, icon: LayoutDashboard, label: 'Home', managed: false },
  { to: '/app/portfolio', icon: PieChart, label: 'Portfolio', managed: false },
  { to: '/app/automation', icon: Zap, label: 'Automation', managed: true },
  { to: '/app/exceptions', icon: AlertCircle, label: 'Exceptions', managed: true },
  { to: '/app/recommendations', icon: BellRing, label: 'Recommendations', managed: false },
  { to: '/app/strategy', icon: Target, label: 'Strategy', managed: false },
  { to: '/app/activity', icon: Activity, label: 'Activity', managed: false },
  { to: '/app/records', icon: Shield, label: 'Records', managed: false },
  { to: '/app/documents', icon: FileText, label: 'Documents', managed: false },
  { to: '/app/support', icon: MessageSquare, label: 'Support', managed: false },
  { to: '/app/account', icon: User, label: 'Account', managed: false },
];

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isManaged = profile?.subscription_tier === 'managed';
  const NAV_ITEMS = isManaged ? MANAGED_NAV : BASE_NAV;

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const mgmtMode = profile?.management_mode === 'auto' ? 'Auto-managed' : 'Review mode';

  return (
    <div className="flex h-screen overflow-hidden bg-charcoal">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 flex flex-col h-full
        bg-charcoal border-r border-charcoal-lighter/60
        transition-all duration-200
        ${collapsed ? 'w-14' : 'w-56'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-2 px-3 py-4 border-b border-charcoal-lighter/60 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 bg-mint rounded-app flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-charcoal" />
          </div>
          {!collapsed && (
            <div className="flex items-baseline gap-1 overflow-hidden">
              <span className="text-sm font-bold text-white">ReFi</span>
              <span className="text-xs font-light text-gray-500">Automated</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(({ to, end, icon: Icon, label, managed: isManagedItem }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 mx-1 my-0.5 rounded-app transition-all duration-150 group relative
                ${isActive
                  ? 'bg-mint/10 text-mint border-l-2 border-mint -ml-0 pl-[10px]'
                  : isManagedItem
                  ? 'text-gray-400 hover:bg-charcoal-light hover:text-mint'
                  : 'text-gray-400 hover:bg-charcoal-light hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium flex-1">{label}</span>
              )}
              {!collapsed && isManagedItem && (
                <div className="w-1.5 h-1.5 bg-mint rounded-full shrink-0" />
              )}
              {collapsed && (
                <div className="absolute left-14 bg-charcoal-lighter border border-charcoal-border rounded-app px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-dropdown z-50">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: mode + user */}
        <div className="border-t border-charcoal-lighter/60 p-3">
          {!collapsed && (
            <div className="mb-3 px-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Management</span>
                <span className="text-xs text-mint font-medium">{mgmtMode}</span>
              </div>
            </div>
          )}
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 mb-2">
              <div className="w-7 h-7 bg-charcoal-lighter border border-charcoal-border rounded-full flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{profile?.full_name || 'Investor'}</p>
                <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => navigate('/admin')}
            className={`flex items-center gap-2 w-full px-2 py-2 rounded-app text-gray-600 hover:text-error hover:bg-error/5 transition-all text-xs mb-1 ${collapsed ? 'justify-center' : ''}`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && 'Admin Console'}
          </button>
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-2 w-full px-2 py-2 rounded-app text-gray-500 hover:text-error hover:bg-error/10 transition-all text-xs ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && 'Sign out'}
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-charcoal-lighter border border-charcoal-border rounded-full items-center justify-center text-gray-500 hover:text-white transition-colors"
        >
          <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-charcoal-lighter/60 bg-charcoal">
          <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-mint rounded flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-charcoal" />
            </div>
            <span className="text-sm font-bold text-white">ReFi</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white opacity-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper mode banner */}
        {!profile?.brokerage_connected && (
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-warning/10 border-b border-warning/20 shrink-0">
            <FlaskConical className="w-3.5 h-3.5 text-warning" />
            <span className="text-xs text-warning font-medium">Simulated mode</span>
            <span className="text-xs text-gray-500">— No real trades are placed. Connect your brokerage to go live.</span>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
