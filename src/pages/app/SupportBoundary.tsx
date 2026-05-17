import { useState } from 'react';
import {
  Shield, AlertTriangle, MessageSquare, CheckCircle, X,
  HelpCircle, FileText, ExternalLink, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const SUPPORT_CATEGORIES = [
  { id: 'account', label: 'Account access', icon: HelpCircle },
  { id: 'billing', label: 'Billing & subscription', icon: FileText },
  { id: 'brokerage', label: 'Brokerage connection', icon: Shield },
  { id: 'automation', label: 'Automation settings', icon: Shield },
  { id: 'technical', label: 'Technical issue', icon: HelpCircle },
  { id: 'records', label: 'Record inquiry', icon: FileText },
];

const PROHIBITED_KEYWORDS = [
  'should i buy', 'should i sell', 'what stock', 'which stock', 'recommend',
  'is it a good time', 'market outlook', 'price target', 'good investment',
  'what do you think about', 'should i invest in', 'buy or sell',
  'financial advice', 'investment advice', 'personal advice',
  'pick a stock', 'best etf', 'which fund', 'allocation advice',
];

const CANNED_RESPONSES: Record<string, string> = {
  account: 'For account access issues, please try resetting your password. If you continue to have problems, describe the specific error you are seeing.',
  billing: 'For billing questions, you can view and manage your subscription from the Account page. Changes take effect at the start of your next billing cycle.',
  brokerage: 'Brokerage connection issues are typically resolved by disconnecting and reconnecting your broker. Ensure your brokerage credentials are up to date.',
  automation: 'Automation settings can be managed from the Automation Center. You can pause, resume, or modify your execution policy at any time.',
  technical: 'For technical issues, please describe what you expected to happen versus what actually happened. Include any error messages you see on screen.',
  records: 'All advisory records are available on the Records page. Records cannot be modified or deleted. If you believe a record is inaccurate, please describe the discrepancy.',
};

interface SupportEvent {
  id: string;
  category: string;
  message: string;
  blocked: boolean;
  created_at: string;
}

export default function SupportBoundary() {
  const { user } = useAuth();
  const [category, setCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<SupportEvent[]>([]);

  function detectProhibited(text: string): boolean {
    const lower = text.toLowerCase();
    return PROHIBITED_KEYWORDS.some(kw => lower.includes(kw));
  }

  function handleMessageChange(text: string) {
    setMessage(text);
    setBlocked(detectProhibited(text));
  }

  async function handleSubmit() {
    if (!user || !category || blocked || !message.trim()) return;
    setSubmitting(true);

    await supabase.from('activity_events').insert({
      user_id: user.id,
      event_type: 'support_request',
      title: `Support request: ${SUPPORT_CATEGORIES.find(c => c.id === category)?.label}`,
      description: `Category: ${category}. Message: ${message.slice(0, 200)}`,
      status: 'completed',
    });

    setHistory(prev => [{
      id: crypto.randomUUID(),
      category: category,
      message: message,
      blocked: false,
      created_at: new Date().toISOString(),
    }, ...prev]);

    setSubmitting(false);
    setSubmitted(true);
  }

  function reset() {
    setCategory(null);
    setMessage('');
    setBlocked(false);
    setSubmitted(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-mint" />
          <h1 className="text-xl font-bold text-white">Support</h1>
        </div>
        <p className="text-sm text-gray-500">
          Technical support for account, billing, and platform issues. ReFi staff do not provide personalized investment advice.
        </p>
      </div>

      {/* Boundary notice */}
      <div className="bg-warning/5 border border-warning/20 rounded-app-md p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-warning mb-1">Support boundary</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            ReFi Trading support staff are prohibited from providing personalized investment advice, specific trade recommendations, or market opinions. All investment advice is generated exclusively by the ReFi software platform through your advisory profile.
          </p>
        </div>
      </div>

      {/* What support CAN and CANNOT help with */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-success" />
            <h3 className="text-sm font-semibold text-white">Support can help with</h3>
          </div>
          <ul className="space-y-2">
            {[
              'Account access and password issues',
              'Billing and subscription changes',
              'Brokerage connection troubleshooting',
              'Automation settings and pause/resume',
              'Technical errors and bug reports',
              'Record inquiries and exports',
              'Platform navigation questions',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-success shrink-0 mt-0.5" />
                <span className="text-xs text-gray-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5">
          <div className="flex items-center gap-2 mb-3">
            <X className="w-4 h-4 text-error" />
            <h3 className="text-sm font-semibold text-white">Support cannot help with</h3>
          </div>
          <ul className="space-y-2">
            {[
              'Personalized investment advice',
              'Specific buy/sell recommendations',
              'Market outlook or predictions',
              'Individual stock or fund opinions',
              'Allocation changes outside the platform',
              'Tax advice or financial planning',
              'Advice about when to trade',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <X className="w-3 h-3 text-error shrink-0 mt-0.5" />
                <span className="text-xs text-gray-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {submitted ? (
        <div className="bg-success/5 border border-success/20 rounded-app-md p-6 text-center mb-6">
          <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Request submitted</h3>
          <p className="text-xs text-gray-400 mb-4">
            Your support request has been logged. Responses are limited to technical assistance only.
          </p>
          {CANNED_RESPONSES[category!] && (
            <div className="bg-charcoal-light border border-charcoal-border rounded-app p-4 text-left mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Automated response</p>
              <p className="text-xs text-gray-300 leading-relaxed">{CANNED_RESPONSES[category!]}</p>
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={reset}>Submit another request</Button>
        </div>
      ) : (
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Submit a support request</h3>

          {/* Category selection */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Category</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SUPPORT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-app border transition-all text-left ${
                    category === cat.id
                      ? 'border-mint/40 bg-mint/5 text-mint'
                      : 'border-charcoal-border text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Describe your issue</p>
            <textarea
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Describe the technical issue you need help with..."
              rows={4}
              className="w-full bg-charcoal-light border border-charcoal-border rounded-app px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-mint/40 resize-none"
            />
          </div>

          {/* Prohibited advice detection */}
          {blocked && (
            <div className="bg-error/5 border border-error/20 rounded-app-md p-4 mb-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-error mb-0.5">Investment advice detected</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your message appears to request personalized investment advice. ReFi staff cannot provide this. All investment recommendations are generated exclusively by the ReFi software platform. Please rephrase your request to focus on a technical or account issue.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!category || !message.trim() || blocked}
              size="sm"
              className="gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Submit request
            </Button>
            {blocked && (
              <span className="text-xs text-error">Cannot submit — advice request detected</span>
            )}
          </div>
        </div>
      )}

      {/* Request history */}
      {history.length > 0 && (
        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-charcoal-border">
            <h3 className="text-sm font-semibold text-white">Recent requests</h3>
          </div>
          {history.map(evt => (
            <div key={evt.id} className="px-5 py-3 border-b border-charcoal-border last:border-0 flex items-center gap-3">
              <Clock className="w-3.5 h-3.5 text-gray-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{evt.message}</p>
                <p className="text-xs text-gray-600">{SUPPORT_CATEGORIES.find(c => c.id === evt.category)?.label}</p>
              </div>
              <Badge variant="success">Submitted</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Disclosure */}
      <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-400">Support boundary disclosure:</span> All support interactions are logged. ReFi Trading support staff are trained to decline requests for personalized investment advice, market opinions, or specific trade recommendations. If investment advice is detected in a support request, it will be blocked. All investment advisory services are delivered exclusively through the ReFi software platform via your advisory profile.
        </p>
      </div>
    </div>
  );
}
