"use client";

import { useState, useEffect } from "react";

/* ───── types ───── */
type Tab = "passwords" | "history";

interface LoginLog {
  id: string;
  role: string;
  success: boolean;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

/* ───── helpers ───── */
function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return d; }
}

function truncateUA(ua: string | null): string {
  if (!ua) return "—";
  return ua.length <= 60 ? ua : ua.slice(0, 57) + "...";
}

/* ───── Password Card ───── */
function PasswordCard({ role, label, currentPassword, onChanged }: {
  role: string; label: string; currentPassword: string; onChanged: () => void;
}) {
  const [newPwd, setNewPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showCurrent, setShowCurrent] = useState(true);

  async function changePassword() {
    if (newPwd.length < 6) { setMessage("Min 6 characters"); return; }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change-password", role, password: newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated. Restart server to apply.");
        setNewPwd("");
        onChanged();
      } else {
        setMessage(data.error || "Failed");
      }
    } catch { setMessage("Network error"); }
    finally { setLoading(false); }
  }

  const badgeColor = role === 'admin' ? 'bg-red-600' : role === 'sales' ? 'bg-blue-600' : 'bg-green-600';

  return (
    <div className="rounded-xl bg-[#0a1628] border border-white/10 p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className={`${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded`}>{label.toUpperCase()}</span>
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>

      {/* Current password */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs text-gray-400">Current password:</span>
        <span className="font-mono text-sm text-white bg-white/10 px-3 py-1 rounded">
          {showCurrent ? currentPassword : "••••••••••"}
        </span>
        <button onClick={() => setShowCurrent(!showCurrent)}
          className="text-[10px] text-gray-500 hover:text-white transition-colors">
          {showCurrent ? "Hide" : "Show"}
        </button>
      </div>

      {/* Change password */}
      <div className="flex gap-2">
        <input type="text" placeholder="New password (min 6 chars)..." value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
          className="flex-1 bg-[#1a2a40] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors" />
        <button onClick={changePassword} disabled={loading || newPwd.length < 6}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
          {loading ? "Saving..." : "Change"}
        </button>
      </div>

      {message && (
        <p className={`text-xs mt-2 ${message.includes("updated") ? "text-green-400" : "text-red-400"}`}>{message}</p>
      )}
    </div>
  );
}

/* ───── Main page ───── */
export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("passwords");
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [passwords, setPasswords] = useState<{ admin: string; sales: string; management: string }>({ admin: "...", sales: "...", management: "..." });
  const [logsLoading, setLogsLoading] = useState(false);

  async function loadData() {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin-settings");
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs ?? []);
        if (data.passwords) setPasswords(data.passwords);
      }
    } catch { /* ignore */ }
    finally { setLogsLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a1628]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Password management & login history — admin only</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(["passwords", "history"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-[#0a1628] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            {t === "passwords" ? "Passwords" : "Login History"}
          </button>
        ))}
      </div>

      {/* Passwords Tab */}
      {tab === "passwords" && (
        <div className="space-y-4">
          <PasswordCard role="admin" label="Admin" currentPassword={passwords.admin} onChanged={loadData} />
          <PasswordCard role="sales" label="Sales" currentPassword={passwords.sales} onChanged={loadData} />
          <PasswordCard role="management" label="Management" currentPassword={passwords.management} onChanged={loadData} />

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-xs text-amber-700">
              After changing a password, <strong>restart the dev server</strong> for the new hash to be loaded from .env.local.
              In production, redeploy the application.
            </p>
          </div>
        </div>
      )}

      {/* Login History Tab */}
      {tab === "history" && (
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-[#0a1628]">Recent Login Attempts</h2>
            <button onClick={loadData} disabled={logsLoading}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors disabled:text-gray-400">
              {logsLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No login attempts recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">IP</th>
                    <th className="px-6 py-3">User Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{fmtDate(log.createdAt)}</td>
                      <td className="px-6 py-3"><span className="capitalize text-gray-700 font-medium">{log.role}</span></td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${log.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${log.success ? "bg-green-500" : "bg-red-500"}`} />
                          {log.success ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-500">{log.ip || "—"}</td>
                      <td className="px-6 py-3 text-xs text-gray-400" title={log.userAgent || ""}>{truncateUA(log.userAgent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
