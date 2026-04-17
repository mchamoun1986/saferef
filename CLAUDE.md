# CLAUDE.md — SafeRef

@AGENTS.md

## Contexte
SafeRef : solution SaaS pour la sélection et le dimensionnement de détecteurs de gaz
dans le monde HVAC & réfrigération. Projet prioritaire de Marwan, en développement actif.
Objectif : devenir LA référence en ligne pour la conformité EN378 / EN14624 des systèmes de détection.

## Stack technique
- **Frontend** : Next.js 16 + React 19 + Tailwind CSS 4
- **Backend** : API routes Next.js (App Router)
- **DB** : SQLite via Prisma (libsql adapter) — fichier `saferef.db`
- **Tests** : Vitest
- **PDF** : jsPDF pour génération de rapports
- **Auth** : bcryptjs (login/register dans `src/app/(auth)/`)
- **Icons** : Lucide React
- **Notifications** : Sonner (toasts)

## Structure app — pages

| Route | Rôle |
|---|---|
| `src/app/configurator/` | Configurateur de détecteurs — coeur du produit, wizard multi-étapes |
| `src/app/selector/` | Sélecteur de détecteurs (choix simplifié) |
| `src/app/products/` | Catalogue produits SAMON (détecteurs, contrôleurs, accessoires) |
| `src/app/sales/` | Interface commerciale — devis, BOM |
| `src/app/sales/quotes/` | Gestion des devis (draft → sent → accepted/rejected) |
| `src/app/admin/` | Panneau admin complet (voir ci-dessous) |
| `src/app/(auth)/login/` | Authentification admin |
| `src/app/api/` | 12 routes API REST (CRUD produits, gaz, devis, calculs, sessions) |

## Structure app — admin (modules)

| Module admin | Rôle |
|---|---|
| `admin/products/` | CRUD catalogue produits SAMON |
| `admin/gas/` | Gestion catégories de gaz |
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

## Les 2 moteurs de calcul

### Moteur M1 — Conformité réglementaire (`src/lib/engine/`)
- `core.ts` — calculs M1 EN378 (charge max admissible, RCL, practical limit)
- `evaluate.ts` — évaluation complète d'une zone
- `rule-set.ts` — ensemble de règles
- `types.ts` — types TypeScript
- `__tests__/` — tests unitaires Vitest

### Moteur M2 — Sélection de produits (`src/lib/m2-engine/`)
- `selection-engine.ts` — sélection automatique de détecteurs
- `select-detector.ts` — choix du bon détecteur selon gaz/application
- `select-controller.ts` — choix du contrôleur compatible
- `select-accessories.ts` — accessoires nécessaires
- `build-bom.ts` — génération Bill of Materials (BOM)
- `pricing-engine.ts` — calcul prix avec remises
- `pricing.ts` + `parse-product.ts` — helpers pricing
- `__tests__/` — tests unitaires Vitest

### 3 normes implémentées (`src/lib/rules/`)
- `en378.ts` — EN378 (Europe, norme principale)
- `ashrae15.ts` + `ashrae15-exemptions.ts` — ASHRAE 15 (USA/international)
- `iso5149.ts` — ISO 5149 (international)
- `index.ts` — exports unifiés

## Modèles de données (Prisma)

| Modèle | Rôle | Rows |
|---|---|---|
| `RefrigerantV5` | Réfrigérants (R744, R290, R717...) | seed |
| `GasCategory` | Catégories de gaz (CO2, HFC, HC, NH3) | seed |
| `Application` | Types d'applications (supermarché, cold room...) | seed |
| `SpaceType` | Types d'espaces réglementaires | seed |
| `Product` | Catalogue complet SAMON (détecteurs, contrôleurs, accessoires) | seed |
| `DiscountMatrix` | Matrice de remises client/produit | seed |
| `CalcSheet` | Fiches de calcul sauvegardées (input + résultat) | runtime |
| `Quote` | Devis commerciaux (BOM + pricing + client) | runtime |
| `AdminUser` | Utilisateurs admin | runtime |

## Produits SAMON intégrés
Familles de détecteurs : MIDI, X5, RM, Aquis
Contrôleurs, accessoires, pièces détachées
Chaque produit a : code, prix, gaz compatibles, applications, specs techniques, montage

## Normes & standards (détail)
- **EN378** : sécurité systèmes frigorifiques — méthodes M1 (charge max), M2 (détection), M3 (ventilation)
- **ASHRAE 15** : norme américaine équivalente + exemptions spécifiques
- **ISO 5149** : norme internationale (base de EN378)
- **EN14624** : performance des détecteurs de fuites
- Classes de sécurité : A1, A2L, A2, A3, B1, B2L, B2, B3
- Réfrigérants clés : R744 (CO2), R290 (propane), R717 (NH3), R454B, R32, R1234yf, R1234ze
- Grandeurs : practical limit, ATEL/ODL, LFL, LEL, OEL, GWP, ODP, vapour density

## Plans & specs existants (`docs/superpowers/`)
- `plans/2026-04-15-admin-simulator.md` — plan simulateur admin
- `plans/2026-04-15-m2-product-selection-engine.md` — plan moteur sélection M2
- `plans/2026-04-15-multi-regulation-engine.md` — plan multi-régulation
- `plans/2026-04-15-product-catalog-migration.md` — migration catalogue
- `plans/2026-04-16-sales-module.md` — plan module ventes
- `specs/` — 6 documents de design détaillés
- `test-reports/2026-04-16-full-qa-pass.md` — rapport QA complet

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
- Les textes doivent être bilingues FR/EN (champs labelFr/labelEn)
