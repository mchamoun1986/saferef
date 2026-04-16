import Link from 'next/link';
import { getSessionRole } from '@/lib/auth';

const ROLE_DEFAULTS: Record<string, string> = {
  admin: '/admin',
  sales: '/sales',
  management: '/admin/products',
};

export default async function ForbiddenPage() {
  const role = await getSessionRole();
  const backUrl = role ? (ROLE_DEFAULTS[role] ?? '/') : '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-0.5 mb-6">
          <span className="text-[#E63946] font-extrabold text-3xl tracking-tight">Safe</span>
          <span className="text-[#16354B] font-extrabold text-3xl tracking-tight">Ref</span>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-[#16354B] mb-2">Access Denied</h1>
          <p className="text-gray-600 text-sm mb-6">
            This section is restricted. Your current role does not have access.
          </p>
          {role && (
            <p className="text-xs text-gray-400 mb-6">
              Logged in as <strong className="uppercase">{role}</strong>
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Link href={backUrl}
              className="bg-[#E63946] hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
              Back to my dashboard
            </Link>
            <form action="/api/logout" method="POST">
              <button type="submit"
                className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors">
                Logout and sign in as different role
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
