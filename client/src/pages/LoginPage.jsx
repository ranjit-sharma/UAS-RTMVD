// src/pages/LoginPage.jsx ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â MVC View Layer
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useDataSource } from '../context/DataSourceContext.jsx';
import { Logo } from '../components/common/Logo.jsx';
import toast from 'react-hot-toast';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address').max(254),
  password: z.string().min(1, 'Password is required').max(128),
  role: z.enum(['admin', 'operator', 'viewer']).optional(),
});

export function LoginPage() {
  const { login, register: registerAccount } = useAuth();
  const { dataSourceMode, setDataSourceMode } = useDataSource();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data) {
    setLoginError('');
    try {
      if (isRegistering) {
        if (!data.name?.trim() || data.name.trim().length < 2) {
          setLoginError('Name must be at least 2 characters');
          return;
        }
        if (data.password.length < 8) {
          setLoginError('Password must be at least 8 characters');
          return;
        }
        await registerAccount({ ...data, name: data.name.trim() });
        toast.success('Account created successfully!');
      } else {
        const { name, role, ...credentials } = data;
        await login(credentials);
        toast.success('Successfully logged in!');
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password');
      toast.error(err.message || 'Login failed');
    }
  }



  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      style={{ background: 'var(--neu-bg)' }}
    >
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-emerald-500 opacity-10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-500 opacity-10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-4xl neu-flat flex flex-col md:flex-row overflow-hidden relative z-10 border-0" style={{ padding: 0 }}>
        
        {/* Left Side: Brand Showcase */}
        <div 
          className="hidden md:flex md:w-5/12 p-10 flex-col justify-between relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
        >
          <div className="relative z-10 text-white drop-shadow-lg">
            <Logo size="large" showText={false} />
            <h1 className="text-4xl font-extrabold mt-6 leading-tight tracking-tight">UAS-<br />RTMVD</h1>
            <p className="mt-4 text-white/90 text-sm font-medium leading-relaxed">
              Real-Time Monitoring and Visualization Dashboard.<br/><br/>Welcome to the central command hub. This advanced telemetry suite provides real-time atmospheric tracking, live environmental payload monitoring, and historical flight data analysis all in one seamless interface.
            </p>
          </div>
          
          <div className="relative z-10 text-white/70 text-[10px] font-bold uppercase tracking-widest mt-12">Secure Access Portal - v2.4.0
          </div>
          
          {/* Subtle Decorative Elements */}
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/4 -left-12 w-48 h-48 bg-black/10 rounded-full blur-xl"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center bg-[var(--neu-surface)]">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="md:hidden flex flex-col items-center text-center mb-8">
            <Logo size="medium" showText={false} />
            <h1 className="text-2xl font-extrabold grad-text-primary mt-4 tracking-tight">UAS-RTMVD</h1>
            <p className="text-subtle text-xs mt-1">Real-Time Monitoring & Visualization Dashboard</p>
          </div>

          <div className="mb-8">
            <h2 className="text-main text-2xl font-bold tracking-tight">
              {isRegistering ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-subtle text-sm mt-1">
              {isRegistering
                ? 'Create a viewer account to access UAS-RTMVD.'
                : 'Please enter your credentials to access the system.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {loginError && (
              <div className="bg-red-500/10 text-red-500 p-3 rounded-xl flex items-center gap-3 text-sm font-semibold border border-red-500/20">
                <AlertCircle size={18} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-[11px] text-subtle uppercase tracking-wider mb-2 font-bold">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name')}
                  className="neu-pressed w-full px-4 py-3.5 text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>
            )}
            {isRegistering && import.meta.env.DEV && (
              <div>
                <label htmlFor="role" className="block text-[11px] text-subtle uppercase tracking-wider mb-2 font-bold">
                  Account Role (Development Only)
                </label>
                <select
                  id="role"
                  {...register('role')}
                  className="neu-pressed w-full px-4 py-3.5 text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  <option value="viewer">Viewer</option>
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-[11px] text-subtle uppercase tracking-wider mb-2 font-bold">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="neu-pressed w-full px-4 py-3.5 text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                placeholder="admin@uas-rtmvd.local"
              />
              {errors.email && (
                <p className="mt-1.5 text-red-500 text-xs font-semibold">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] text-subtle uppercase tracking-wider mb-2 font-bold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  {...register('password')}
                  className="neu-pressed w-full px-4 py-3.5 pr-12 text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                  placeholder="*************"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-main"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && !isRegistering && (
                <p className="mt-1.5 text-red-500 text-xs font-semibold">{errors.password.message}</p>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-[11px] text-subtle uppercase tracking-wider mb-2 font-bold">
                Initial Data Source Mode
              </label>
              <div className="flex gap-2 bg-[var(--neu-surface-raised)] p-1.5 rounded-xl border border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setDataSourceMode('instrument')}
                    className="flex-1 py-2 text-xs font-bold rounded-lg transition-all hover:scale-[1.02]"
                    style={{
                      background: dataSourceMode === 'instrument' ? 'var(--accent-primary)' : 'transparent',
                      color: dataSourceMode === 'instrument' ? 'var(--neu-bg)' : 'var(--text-subtle)',
                      boxShadow: dataSourceMode === 'instrument' ? '0 4px 6px -1px rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    Live Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setDataSourceMode('simulated')}
                    className="flex-1 py-2 text-xs font-bold rounded-lg transition-all hover:scale-[1.02]"
                    style={{
                      background: dataSourceMode === 'simulated' ? 'var(--accent-primary)' : 'transparent',
                      color: dataSourceMode === 'simulated' ? 'var(--neu-bg)' : 'var(--text-subtle)',
                      boxShadow: dataSourceMode === 'simulated' ? '0 4px 6px -1px rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    Dummy Data
                  </button>
                </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="neu-button w-full py-3.5 mt-6 text-sm font-bold border-none rounded-xl disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--accent-primary)]/30"
              style={{ background: 'var(--accent-primary)', color: 'var(--neu-bg)' }}
            >
              {isSubmitting
                ? isRegistering ? 'Creating account...' : 'Signing in...'
                : isRegistering ? 'Create account' : 'Sign In'}
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setIsRegistering((current) => !current);
              setLoginError('');
            }}
            className="mt-5 text-sm font-semibold text-[var(--accent-primary)] hover:underline"
          >
            {isRegistering
              ? 'Already have an account? Sign in'
              : 'Need an account? Create one'}
          </button>
        </div>
      </div>
    </div>
  );
}


