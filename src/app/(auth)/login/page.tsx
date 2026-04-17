'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ROLE_DEFAULTS: Record<string, string> = {
  admin: '/admin',
  sales: '/admin/quotes',
  management: '/admin',
};

function LoginForm() {
  const [role, setRole] = useState<'admin' | 'sales' | 'management'>('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Login failed');
        return;
      }

      router.push(from || ROLE_DEFAULTS[role]);
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-red-600 hover:bg-red-700',
    sales: 'bg-blue-600 hover:bg-blue-700',
    management: 'bg-green-600 hover:bg-green-700',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <span className="text-[#E63946] font-extrabold text-3xl tracking-tight">Safe</span>
            <span className="text-[#16354B] font-extrabold text-3xl tracking-tight">Ref</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Restricted access</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#16354B]">Sign in</h2>
            <p className="text-xs text-gray-400 mt-0.5">Select your role and enter password</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              >
                <option value="admin">Admin</option>
                <option value="sales">Sales</option>
                <option value="management">Management</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                autoFocus
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className={`w-full text-white py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 ${roleColors[role]}`}
          >
            {loading ? 'Signing in...' : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">&larr; Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
