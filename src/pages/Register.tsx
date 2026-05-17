import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 12,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'];
  const colors = ['', 'bg-error', 'bg-warning', 'bg-warning', 'bg-mint', 'bg-mint'];
  const textColors = ['', 'text-error', 'text-warning', 'text-warning', 'text-mint', 'text-mint'];

  if (!password) return null;

  return (
    <div className="mt-1">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${score >= i + 1 ? colors[score] : 'bg-charcoal-border'}`}
          />
        ))}
      </div>
      <p className={`text-xs ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState('');
  const [usConfirm, setUsConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = fullName.length >= 2 && email.includes('@') && password.length >= 12 && state && usConfirm;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error.message || 'Failed to create account. Please try again.');
    } else {
      navigate('/onboarding');
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 bg-mint rounded-app flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-charcoal" />
          </div>
          <span className="text-xl font-bold text-white">ReFi</span>
          <span className="text-xl font-light text-gray-400">Trading</span>
        </div>

        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-8">
          <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-gray-400 mb-2">Start your personalized investing journey</p>
          <div className="bg-mint/5 border border-mint/10 rounded-app px-3 py-2 mb-6">
            <p className="text-xs text-gray-400">You will review your profile and disclosures before activating investing. This is not a bank account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Legal full name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jane Smith"
              required
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 12 characters"
                  required
                  className="w-full bg-charcoal border border-gray-600 rounded-app-sm px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-mint focus:ring-mint/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300">State of residence</label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                required
                className="bg-charcoal border border-gray-600 rounded-app-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:border-mint focus:ring-mint/30"
              >
                <option value="">Select your state</option>
                {['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={usConfirm}
                onChange={e => setUsConfirm(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-mint"
              />
              <span className="text-xs text-gray-400">
                I confirm I am a U.S. person opening this account for personal investing purposes.
              </span>
            </label>

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-app px-3 py-2.5">
                <p className="text-xs text-error">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} disabled={!isValid} className="w-full mt-2">
              Create account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-charcoal-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
              Bank-grade encryption protects your data
            </div>
            <p className="text-xs text-gray-600 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-mint hover:text-mint-light transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
