# Remove Product.apps — Single Source of Truth via Application.productFamilies

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the `apps` field from products and use `Application.productFamilies` as the single source of truth for which product families are compatible with which applications.

**Architecture:** The `DesignerInputs` type gets a new optional `applicationFamilies: string[]` field. Callers (StepProducts, SelectorWizard) look up the selected application's `productFamilies` from the API data and pass it to the engine. The engine filters by family name instead of `p.apps`. Then `apps` is removed from schema, types, seed, admin UI, and tests.

**Tech Stack:** Prisma, Next.js 16, TypeScript, Vitest

---

### Task 1: Add applicationFamilies to DesignerInputs + fix designer.ts engine

**Files:**
- Modify: `src/lib/m2-engine/designer-types.ts`
- Modify: `src/lib/m2-engine/designer.ts`

Replace both `p.apps` filters in designer.ts with family-based filtering using `inputs.applicationFamilies`.

### Task 2: Pass applicationFamilies from callers (StepProducts + SelectorWizard)

**Files:**
- Modify: `src/components/configurator/StepProducts.tsx`
- Modify: `src/components/selector/SelectorWizard.tsx`

Both callers fetch `/api/applications` data. They must look up the selected application's `productFamilies`, parse it, and pass as `applicationFamilies` to `designer.generate()`.

### Task 3: Remove apps from ProductV2 type + parse-product + types

**Files:**
- Modify: `src/lib/m2-engine/designer-types.ts` (remove `apps` from ProductV2)
- Modify: `src/lib/m2-engine/types.ts` (remove `apps` from ProductRecord)
- Modify: `src/lib/engine/types.ts` (remove `apps` from ProductEntry)
- Modify: `src/lib/m2-engine/parse-product.ts` (remove apps parsing)
- Modify all files that reference `p.apps` or `apps: p.apps` — remove

### Task 4: Remove apps from admin UI + seed data

**Files:**
- Modify: `src/app/admin/products/page.tsx` (remove apps textarea)
- Modify: `src/app/admin/catalogue/page.tsx` (remove apps from interface)
- Modify: `src/app/admin/engine-m2/page.tsx` (update docs)
- Modify: `prisma/seed-data/products-v2.ts` (remove apps field)

### Task 5: Remove apps from Prisma schema + update legacy engine

**Files:**
- Modify: `prisma/schema.prisma` (remove apps column from Product)
- Modify: `src/lib/m2-engine/selection-engine.ts` (remove f0_application fallback)

### Task 6: Update all tests

**Files:**
- Modify: 8 test files (remove `apps` from fixtures, update filter tests)

### Task 7: Build + test + push schema + deploy

Run all tests, build, push schema to local + Turso, push to GitHub.
