"use client";

import ArchitectureOverview from "@/components/admin/ArchitectureOverview";

export default function ArchitecturePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <ArchitectureOverview defaultExpanded />
    </div>
  );
}
