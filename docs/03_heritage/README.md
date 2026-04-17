# Heritage — Sources de SafeRef

Ce dossier contient les versions antérieures qui ont mené à SafeRef.
**À lire comme référence, pas à exécuter.**

## detectbuilder-v2/
Dernière version du moteur avant migration vers SafeRef (avril 2026).
6 fichiers TypeScript — le moteur complet :

| Fichier | Lignes | Rôle |
|---|---|---|
| `regulation-engine.ts` | 996 | Moteur M1 EN378 — détection, seuils, placement, quantité, trace |
| `selection-engine.ts` | 1137 | Moteur M2 — sélection détecteur/contrôleur/accessoires |
| `pricing-engine.ts` | 380 | Pricing avec matrice de remises |
| `configurator-engine.ts` | 89 | Orchestrateur regulation → selection → pricing |
| `engine-types.ts` | — | Types TypeScript partagés |
| `validations.ts` | — | Validations d'entrée |

### Ce que DB2 fait MIEUX que SafeRef actuel
- **Traçabilité** : RegulationTrace avec 5 pathEvaluations + calculs intermédiaires
- **Review flags** : MR-001 à MR-009+ codifiés
- **Source clauses** : références EN378 exactes par décision
- **Orchestrateur** : configurator-engine chaîne les 3 moteurs

## engine-specs-v5/
Spécifications de conception V5 — la documentation métier qui définit :
- Le moteur de régulation (EN378, ASHRAE 15, ISO 5149)
- Le moteur de sélection produit
- Le moteur de pricing
- Le data dictionary
- Le trace engine
- Le master engine (orchestration)
