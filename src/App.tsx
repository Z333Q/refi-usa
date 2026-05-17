import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Eligibility from './pages/Eligibility';
import Onboarding from './pages/Onboarding';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/app/Home';
import Portfolio from './pages/app/Portfolio';
import Strategy from './pages/app/Strategy';
import Subscription from './pages/app/Subscription';
import ManagedActivation from './pages/app/ManagedActivation';
import AutomationCenter from './pages/app/AutomationCenter';
import ExceptionReview from './pages/app/ExceptionReview';
import Recommendations from './pages/app/Recommendations';
import Activity from './pages/app/Activity';
import Records from './pages/app/Records';
import Documents from './pages/app/Documents';
import Account from './pages/app/Account';
import AdviceBasis from './pages/app/AdviceBasis';
import SupportBoundary from './pages/app/SupportBoundary';
import AdminLayout from './components/layout/AdminLayout';
import EvidenceConsole from './pages/admin/EvidenceConsole';
import ComplianceEngine from './pages/admin/ComplianceEngine';
import SupportReview from './pages/admin/SupportReview';
import BrokerOperations from './pages/admin/BrokerOperations';
import IncidentLog from './pages/admin/IncidentLog';
import ExaminerExport from './pages/admin/ExaminerExport';
import AutomatedTradeDemo from './pages/demo/AutomatedTradeDemo';
import SignalTradeDemo from './pages/demo/SignalTradeDemo';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile && !profile.onboarding_complete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function PublicGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/eligibility" element={<PublicGuard><Eligibility /></PublicGuard>} />
      <Route path="/login" element={<PublicGuard><Login /></PublicGuard>} />
      <Route path="/register" element={<PublicGuard><Register /></PublicGuard>} />
      <Route path="/onboarding" element={<AuthGuard><Onboarding /></AuthGuard>} />
      <Route path="/app" element={
        <AuthGuard>
          <OnboardingGuard>
            <AppLayout />
          </OnboardingGuard>
        </AuthGuard>
      }>
        <Route index element={<Home />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="strategy" element={<Strategy />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="managed-activation" element={<ManagedActivation />} />
        <Route path="automation" element={<AutomationCenter />} />
        <Route path="exceptions" element={<ExceptionReview />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="activity" element={<Activity />} />
        <Route path="records" element={<Records />} />
        <Route path="documents" element={<Documents />} />
        <Route path="account" element={<Account />} />
        <Route path="advice-basis" element={<AdviceBasis />} />
        <Route path="support" element={<SupportBoundary />} />
      </Route>
      <Route path="/admin" element={<AuthGuard><AdminLayout /></AuthGuard>}>
        <Route index element={<EvidenceConsole />} />
        <Route path="compliance" element={<ComplianceEngine />} />
        <Route path="support-review" element={<SupportReview />} />
        <Route path="broker-ops" element={<BrokerOperations />} />
        <Route path="incidents" element={<IncidentLog />} />
        <Route path="examiner-export" element={<ExaminerExport />} />
        <Route path="demo-automated" element={<AutomatedTradeDemo />} />
        <Route path="demo-signal" element={<SignalTradeDemo />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
