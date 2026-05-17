import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Shield, Cpu, MessageSquare, Link2, AlertTriangle, FileDown,
  ArrowLeft, Lock, Play
} from 'lucide-react';

const ADMIN_NAV = [
  { to: '/admin', end: true, icon: Shield, label: 'Evidence Console' },
  { to: '/admin/compliance', icon: Cpu, label: 'Compliance Engine' },
  { to: '/admin/support-review', icon: MessageSquare, label: 'Support Review' },
  { to: '/admin/broker-ops', icon: Link2, label: 'Broker Operations' },
  { to: '/admin/incidents', icon: AlertTriangle, label: 'Incident Log' },
  { to: '/admin/examiner-export', icon: FileDown, label: 'Examiner Export' },
  { to: '/admin/demo-automated', icon: Play, label: 'Demo: Automated' },
  { to: '/admin/demo-signal', icon: Play, label: 'Demo: Signal' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-charcoal-deep">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col h-full bg-charcoal border-r border-error/20">
        {/* Header */}
        <div className="px-4 py-4 border-b border-error/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-error/20 border border-error/40 rounded-app flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-error" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Admin</span>
              <span className="text-xs text-error ml-1.5 font-medium">INTERNAL</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
          {ADMIN_NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 mx-1 my-0.5 rounded-app transition-all duration-150
                ${isActive
                  ? 'bg-error/10 text-error border-l-2 border-error pl-[14px]'
                  : 'text-gray-400 hover:bg-charcoal-light hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Back button */}
        <div className="border-t border-error/20 p-3">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-app text-gray-400 hover:text-mint hover:bg-mint/5 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Client App
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Warning banner */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-error/5 border-b border-error/20 shrink-0">
          <Lock className="w-3.5 h-3.5 text-error" />
          <span className="text-xs text-error font-medium">Internal Compliance Console</span>
          <span className="text-xs text-gray-500">— Not visible to clients</span>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
