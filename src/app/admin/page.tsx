"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ───── types ───── */
interface CalcSheet {
  id: string;
  ref: string;
  client: string;
  status: string;
  createdAt: string;
  totalDetectors: number;
  projectName?: string;
}

interface DashboardData {
  refrigerants: { id: string }[];
  applications: { id: string }[];
  spaceTypes: { id: string }[];
  calcSheets: CalcSheet[];
}

/* ───── helpers ───── */
function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

const STATUS_DOT: Record<string, string> = {
  draft: "bg-gray-400",
  pending: "bg-amber-400",
  validated: "bg-blue-400",
  sent: "bg-emerald-400",
  archived: "bg-gray-500",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  pending: "Pending",
  validated: "Validated",
  sent: "Sent",
  archived: "Archived",
};

/* ───── skeleton ───── */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-white/5 ${className}`} />
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-xl bg-[#0f1b2e] border border-white/5 p-6">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/* ───── quick links ───── */
const QUICK_LINKS = [
  { href: "/admin/gas", label: "Refrigerants", icon: "🧪", desc: "Gas categories & refrigerant database" },
  { href: "/admin/applications", label: "Applications", icon: "🏭", desc: "Application configurations (M1 + M2)" },
  { href: "/admin/space-types", label: "Space Types", icon: "📐", desc: "Zone types with regulatory defaults" },
  { href: "/admin/calc-sheets", label: "Calc Sheets", icon: "📄", desc: "Saved calculation sheets" },
];

/* ───── component ───── */
export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [refRes, appRes, stRes, csRes] = await Promise.all([
          fetch("/api/refrigerants-v5"),
          fetch("/api/applications"),
          fetch("/api/space-types"),
          fetch("/api/calc-sheets"),
        ]);

        const [refrigerants, applications, spaceTypes, calcSheets] = await Promise.all([
          refRes.ok ? refRes.json() : [],
          appRes.ok ? appRes.json() : [],
          stRes.ok ? stRes.json() : [],
          csRes.ok ? csRes.json() : [],
        ]);

        setData({
          refrigerants: Array.isArray(refrigerants) ? refrigerants : refrigerants.data ?? [],
          applications: Array.isArray(applications) ? applications : [],
          spaceTypes: Array.isArray(spaceTypes) ? spaceTypes : [],
          calcSheets: Array.isArray(calcSheets) ? calcSheets : calcSheets.data ?? [],
        });
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ── derived stats ── */
  const stats = data
    ? {
        totalRefs: data.refrigerants.length,
        totalApps: data.applications.length,
        totalSpaceTypes: data.spaceTypes.length,
        totalCalcSheets: data.calcSheets.length,
        sheetsValidated: data.calcSheets.filter((s) => s.status === "validated").length,
        sheetsDraft: data.calcSheets.filter((s) => s.status === "draft").length,
        sheetsSent: data.calcSheets.filter((s) => s.status === "sent").length,
      }
    : null;

  const recentSheets = data?.calcSheets.slice(0, 5) ?? [];

  /* ── render ── */
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a1628]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">DetectCalc Admin Overview</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Failed to load dashboard data: {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : stats ? (
          <>
            {/* Refrigerants */}
            <div className="rounded-xl bg-[#0a1628] text-white p-6 border border-white/5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Refrigerants</p>
              <p className="text-3xl font-bold">{stats.totalRefs}</p>
              <p className="mt-3 text-xs text-gray-500">In database</p>
            </div>

            {/* Applications */}
            <div className="rounded-xl bg-[#0a1628] text-white p-6 border border-white/5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Applications</p>
              <p className="text-3xl font-bold">{stats.totalApps}</p>
              <p className="mt-3 text-xs text-gray-500">Configured</p>
            </div>

            {/* Space Types */}
            <div className="rounded-xl bg-[#0a1628] text-white p-6 border border-white/5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Space Types</p>
              <p className="text-3xl font-bold">{stats.totalSpaceTypes}</p>
              <p className="mt-3 text-xs text-gray-500">Zone definitions</p>
            </div>

            {/* Calc Sheets */}
            <div className="rounded-xl bg-[#0a1628] text-white p-6 border border-white/5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Calc Sheets</p>
              <p className="text-3xl font-bold">{stats.totalCalcSheets}</p>
              <div className="mt-3 flex gap-2 text-xs text-gray-400">
                <span className="bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded">{stats.sheetsDraft} draft</span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">{stats.sheetsValidated} valid</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">{stats.sheetsSent} sent</span>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Two-column: recent calc sheets + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent calc sheets */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-[#0a1628]">Recent Calc Sheets</h2>
            <Link
              href="/admin/calc-sheets"
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse rounded bg-gray-100 h-10 w-full" />
              ))}
            </div>
          ) : recentSheets.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No calc sheets yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Ref</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Detectors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentSheets.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/admin/calc-sheets`}
                  >
                    <td className="px-6 py-3 font-mono text-xs text-gray-700">{s.ref}</td>
                    <td className="px-6 py-3 text-gray-500">{fmtDate(s.createdAt)}</td>
                    <td className="px-6 py-3 text-gray-700">{s.client || "—"}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s.status] ?? "bg-gray-400"}`} />
                        <span className="capitalize text-gray-600">{STATUS_LABEL[s.status] ?? s.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-800">
                      {s.totalDetectors ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick links */}
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#0a1628]">Quick Links</h2>
          </div>
          <div className="p-4 space-y-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="text-xl">{link.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[#0a1628] group-hover:text-blue-600 transition-colors">
                    {link.label}
                  </p>
                  <p className="text-xs text-gray-400">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
