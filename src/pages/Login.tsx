import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError('Invalid email or password. Please try again.');
    } else {
      navigate('/app');
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 bg-mint rounded-app flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-charcoal" />
          </div>
          <span className="text-xl font-bold text-white">ReFi</span>
          <span className="text-xl font-light text-gray-400">Trading</span>
        </div>

        <div className="bg-charcoal-lighter border border-charcoal-border rounded-app-md p-8">
          <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-8">Sign in to your investing account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-app px-3 py-2.5">
                <p className="text-xs text-error">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign in
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-charcoal-border">
            <p className="text-xs text-gray-500 text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-mint hover:text-mint-light transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-600 text-center mt-6 max-w-sm mx-auto">
          By signing in, you agree to our{' '}
          <a href="#" className="text-gray-500 hover:text-gray-400">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-gray-500 hover:text-gray-400">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
