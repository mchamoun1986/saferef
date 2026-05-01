# CLAUDE.md — SafeRef

@AGENTS.md

## Contexte
SafeRef : solution SaaS pour la sélection et le dimensionnement de détecteurs de gaz
dans le monde HVAC & réfrigération. Projet prioritaire de Marwan, en développement actif.
Objectif : devenir LA référence en ligne pour la conformité EN378 / EN14624 des systèmes de détection.

**Live :** `saferef.vercel.app` (Vercel + Turso, 0€/mois)

## Stack technique
- **Frontend** : Next.js 16 + React 19 + Tailwind CSS 4
- **Backend** : API routes Next.js (App Router)
- **DB** : SQLite via Prisma (libsql adapter) — fichier `saferef.db` (Turso en prod)
- **Tests** : Vitest (230 tests, 17 fichiers)
- **PDF** : jsPDF pour génération de rapports
- **Auth** : bcryptjs — 3 rôles (admin/sales/management) via `src/lib/auth.ts` + `src/proxy.ts`
- **Icons** : Lucide React
- **Notifications** : Sonner (toasts)
- **i18n** : 5 langues (en/fr/sv/de/es) via `src/lib/i18n-common.ts`

## Structure app — pages publiques

| Route | Rôle |
|---|---|
| `src/app/page.tsx` | Homepage marketing (hero, tools, features, risks, standards) |
| `src/app/calculator/` | Calculator — EN378/ASHRAE15/ISO5149 compliance, wizard multi-étapes |
| `src/app/selector/` | Selector — configuration rapide, BOM avec pricing tiered |
| `src/app/fgas-checker/` | F-Gas Checker — EU 2024/573 leak check obligations, 2-step wizard |
| `src/app/(auth)/login/` | Authentification admin |
| `src/app/forbidden/` | Page 403 accès refusé |
| `src/app/api/` | 18 routes API REST |

## Structure app — admin (modules)

| Module admin | Rôle |
|---|---|
| `admin/products/` | CRUD catalogue produits SAMON |
| `admin/catalogue/` | Vue catalogue complète |
| `admin/gas/` | Gestion catégories de gaz (GET only — seed) |
| `admin/applications/` | Types d'applications (supermarché, salle des machines...) |
| `admin/space-types/` | Types d'espaces réglementaires |
| `admin/simulator/` | Simulateur M1 (calcul EN378 méthode 1) |
| `admin/simulator-m2/` | Simulateur M2 (sélection produit) |
| `admin/engine/` | Règles moteur M1 documentées |
| `admin/engine-m2/` | Règles moteur M2 documentées |
| `admin/calc-sheets/` | Fiches de calcul sauvegardées |
| `admin/testlab/` | Labo de test M1 |
| `admin/testlab-m2/` | Labo de test M2 |
| `admin/discount-matrix/` | Matrice de remises par groupe client/produit |
| `admin/traceability/` | Traçabilité des calculs |
| `admin/leads/` | Lead capture depuis Calculator/Selector |
| `admin/quotes/` | Devis commerciaux (BOM + pricing + client) |
| `admin/fgas/` | Stats F-Gas Checker (KPIs, top réfrigérants, bandes) |
| `admin/architecture/` | Vue d'ensemble architecture technique |
| `admin/settings/` | Paramètres admin |

## Les 3 moteurs de calcul

### Moteur M1 — Conformité réglementaire (`src/lib/engine/`)
- `core.ts` — calculs M1 EN378 (charge max admissible, RCL, practical limit)
- `evaluate.ts` — évaluation complète d'une zone
- `rule-set.ts` — ensemble de règles
- `types.ts` — types TypeScript
- `__tests__/` — tests unitaires Vitest

### Moteur M2 — Sélection de produits (`src/lib/m2-engine/`)
- `selection-engine.ts` — sélection automatique de détecteurs (filter pipeline F0-F9 + scoring /21)
- `select-controller.ts` — choix du contrôleur compatible
- `select-accessories.ts` — accessoires nécessaires
- `designer.ts` — SystemDesigner V2 (filter pipeline, solution assembly, BOM)
- `designer-types.ts` — types DesignerInputs, Solution, BomComponent, ProductV2
- `build-bom.ts` — génération Bill of Materials (BOM)
- `pricing-engine.ts` — calcul prix avec remises (4 tiers: premium/eco × standalone/centralized)
- `pricing.ts` + `parse-product.ts` — helpers pricing
- `__tests__/` — tests unitaires Vitest

### Moteur F-Gas — Conformité EU 2024/573 (`src/lib/fgas/`)
- `leak-check.ts` — calcul CO2eq, bandes seuils (5t/50t/500t), fréquences contrôle
- `environmental.ts` — équivalents CO2 (voitures/vols/arbres)
- `types.ts` — FGasInput, LeakCheckResult, ThresholdBand
- `__tests__/leak-check.test.ts` — 21 tests validés contre données Carel

### 3 normes implémentées (`src/lib/rules/`)
- `en378.ts` — EN378 (Europe, norme principale)
- `ashrae15.ts` + `ashrae15-exemptions.ts` — ASHRAE 15 (USA/international)
- `iso5149.ts` — ISO 5149 (international)
- `index.ts` — exports unifiés

## Modèles de données (Prisma)

| Modèle | Rôle | Rows |
|---|---|---|
| `RefrigerantV5` | Réfrigérants (R744, R290, R717...) — 47 refs | seed |
| `GasCategory` | Catégories de gaz (CO2, HFC, HC, NH3) | seed |
| `Application` | Types d'applications (supermarché, cold room...) | seed |
| `SpaceType` | Types d'espaces réglementaires | seed |
| `Product` | Catalogue complet SAMON — 135 produits (5 types: detector, sensor, controller, alert, accessory) | seed |
| `DiscountMatrix` | Matrice de remises — 5 groupes produit (A, C, D, F, G) | seed |
| `CalcSheet` | Fiches de calcul sauvegardées (input + résultat) | runtime |
| `Quote` | Devis commerciaux (BOM + pricing + client) | runtime |
| `AdminUser` | Utilisateurs admin (3 rôles) | runtime |
| `Lead` | Lead capture from Calculator/Selector wizard flows | runtime |
| `LoginLog` | Journal des connexions admin | runtime |
| `FGasLog` | Journal des vérifications F-Gas (réfrigérant, charge, CO2eq, bande) | runtime |

## Produits SAMON intégrés
Familles : GLACIAR MIDI, GLACIAR MICRO, GLACIAR RM, X5 Direct Sensor Module, X5 Remote Sensor, X5 Transmitter, GLACIAR Controller 10
Contrôleurs, alertes (beacon, siren, combo), accessoires, pièces détachées
Chaque produit a : code, prix, refs (réfrigérants compatibles), specs techniques, montage, tier, productGroup

## Normes & standards (détail)
- **EN378** : sécurité systèmes frigorifiques — méthodes M1 (charge max), M2 (détection), M3 (ventilation)
- **ASHRAE 15** : norme américaine équivalente + exemptions spécifiques
- **ISO 5149** : norme internationale (base de EN378)
- **EN14624** : performance des détecteurs de fuites
- **EU 2024/573** : règlement F-Gas — contrôles fuites, phase-down HFC
- Classes de sécurité : A1, A2L, A2, A3, B1, B2L, B2, B3
- Réfrigérants clés : R744 (CO2), R290 (propane), R717 (NH3), R454B, R32, R1234yf, R1234ze
- Grandeurs : practical limit, ATEL/ODL, LFL, LEL, OEL, GWP, ODP, vapour density

## Specs & plans (`docs/`)

### Specs actives
- `01_specs/2026-04-15-admin-simulator-design.md` — design simulateur admin
- `01_specs/2026-04-15-multi-regulation-engine-design.md` — design multi-régulation
- `01_specs/2026-04-16-rbac-design.md` — design RBAC 3 rôles
- `superpowers/specs/2026-04-20-results-page-filters-spec.md` — filtres page résultats
- `superpowers/specs/2026-04-26-fgas-checker-v2-design.md` — design F-Gas Checker v2

### Plans actifs
- `02_plans/2026-04-16-sales-module.md` — module ventes (Quote model+API OK, pages /admin/quotes)
- `superpowers/plans/2026-04-21-lead-capture-system.md` — système lead capture
- `superpowers/plans/2026-04-26-fgas-checker.md` — plan F-Gas Checker

### Specs supersédées (historique)
- `01_specs/2026-04-15-fgas-checker-design.md` — SUPERSEDED by fgas-checker-v2-design
- `01_specs/2026-04-15-product-catalog-migration-design.md` — SUPERSEDED by V2 migration
- `01_specs/2026-04-15-m2-product-selection-engine-design.md` — PARTIAL, V2 designer remplace
- `02_plans/2026-04-18-product-relations-m2-rewrite.md` — SUPERSEDED by V2 migration
- `02_plans/2026-04-15-product-catalog-migration.md` — SUPERSEDED by V2 migration

### Rapports QA
- `04_reports/2026-04-16-full-qa-pass.md`
- `QA-REPORT-2026-04-20.md`

## Commandes utiles
- `npm run dev` — serveur de développement (localhost:3000)
- `npm run build` — build production
- `npm test` — lancer les tests Vitest
- `npx prisma db push` — sync schema → DB
- `npx tsx prisma/seed.ts` — seed la base

## Règles strictes
- JAMAIS de fichier à la racine 20_SAFEREF/ sauf config (package.json, tsconfig, etc.)
- Les calculs EN378 doivent être EXACTS — vérifier contre la norme avant de valider
- Preuve avant parole : lancer `npm test` et montrer le résultat avant de dire "ça marche"
- Tout nouveau modèle Prisma doit avoir un seed dans `prisma/seed-data/`
- Les textes doivent être en 5 langues (en/fr/sv/de/es) via i18n-common.ts
