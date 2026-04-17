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

interface RoleSection {
  key: string;
  label: string;
  envVar: string;
}

const ROLE_SECTIONS: RoleSection[] = [
  { key: "admin", label: "Admin", envVar: "ADMIN_PASSWORD_HASH" },
  { key: "sales", label: "Sales", envVar: "SALES_PASSWORD_HASH" },
  { key: "management", label: "Management", envVar: "MANAGEMENT_PASSWORD_HASH" },
];

/* ───── helpers ───── */
function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function truncateUA(ua: string | null): string {
  if (!ua) return "—";
  if (ua.length <= 60) return ua;
  return ua.slice(0, 57) + "...";
}

/* ───── Password Section ───── */
function PasswordSection({ section }: { section: RoleSection }) {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function generateHash() {
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-hash", password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate hash");
        return;
      }
      setHash(data.hash);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function copyHash() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = hash;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-xl bg-[#0a1628] border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-semibold text-white">{section.label}</span>
        <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
          {section.envVar}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Enter new password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 bg-[#1a2a40] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
        />
        <button
          onClick={generateHash}
          disabled={loading || password.length < 4}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          {loading ? "Generating..." : "Generate Hash"}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-2">{error}</p>
      )}

      {hash && (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={hash}
              className="flex-1 bg-[#0f1b2e] border border-white/5 rounded-lg px-3 py-2 text-xs font-mono text-gray-300"
            />
            <button
              onClick={copyHash}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Copy this hash and update <code className="text-gray-400">{section.envVar}</code> in{" "}
            <code className="text-gray-400">.env.local</code>, then restart the server.
          </p>
        </div>
      )}
    </div>
  );
}

/* ───── Main page ───── */
export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("passwords");
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");

  useEffect(() => {
    if (tab === "history") {
      loadLogs();
    }
  }, [tab]);

  async function loadLogs() {
    setLogsLoading(true);
    setLogsError("");
    try {
      const res = await fetch("/api/admin-settings");
      const data = await res.json();
      if (!res.ok) {
        setLogsError(data.error || "Failed to load logs");
        return;
      }
      setLogs(data.logs ?? []);
    } catch {
      setLogsError("Network error");
    } finally {
      setLogsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a1628]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Password management & login history
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("passwords")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "passwords"
              ? "bg-[#0a1628] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Passwords
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "history"
              ? "bg-[#0a1628] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Login History
        </button>
      </div>

      {/* Tab: Passwords */}
      {tab === "passwords" && (
        <div className="space-y-4">
          {ROLE_SECTIONS.map((section) => (
            <PasswordSection key={section.key} section={section} />
          ))}

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mt-6">
            <p className="text-sm text-amber-800 font-medium mb-1">How it works</p>
            <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
              <li>Enter a new password and click &quot;Generate Hash&quot;</li>
              <li>Copy the generated bcrypt hash</li>
              <li>
                Update the corresponding variable in{" "}
                <code className="bg-amber-100 px-1 rounded">.env.local</code>
              </li>
              <li>Restart the dev server for changes to take effect</li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab: Login History */}
      {tab === "history" && (
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-[#0a1628]">Recent Login Attempts</h2>
            <button
              onClick={loadLogs}
              disabled={logsLoading}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors disabled:text-gray-400"
            >
              {logsLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {logsError && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-red-700 text-sm">
              {logsError}
            </div>
          )}

          {logsLoading && logs.length === 0 ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded bg-gray-100 h-10 w-full"
                />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              No login attempts recorded yet
            </div>
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
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                        {fmtDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-3">
                        <span className="capitalize text-gray-700 font-medium">
                          {log.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                            log.success
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              log.success ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {log.success ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-500">
                        {log.ip || "—"}
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-400" title={log.userAgent || ""}>
                        {truncateUA(log.userAgent)}
                      </td>
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
