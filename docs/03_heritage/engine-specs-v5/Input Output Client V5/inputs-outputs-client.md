# SAMON DetectBuilder V5 — Inputs & Outputs Client

> Document de synthese : ce que le client saisit et ce qu'il recoit.
> Les moteurs M1/M2/M3 sont decrits dans leurs specs respectives — ce document ne couvre que l'interface client.

---

## INPUTS CLIENT (3 etapes)

### Etape 1 — Informations Site & Client

| Champ | Type | Obligatoire | Exemple | Utilise par |
|-------|------|:-----------:|---------|-------------|
| Prenom | texte | oui | Jean | Devis |
| Nom | texte | oui | Dupont | Devis |
| Societe | texte | oui | Carrefour | Devis |
| Email | email | oui | j.dupont@carrefour.fr | Devis |
| Telephone | tel | non | +33 6 12 34 56 78 | Devis |
| Nom du projet | texte | oui | Extension chambre froide Marseille | Devis, M3 |
| Pays | liste | oui | FR, SE, UK, DE, ES, IT, NL, BE, NO, OTHER | M2 (`project_country`) |
| Notes | zone texte | non | Libre | Devis |
| Consentement RGPD | case a cocher | oui | — | Legal |

---

### Etape 2 — Selection Application & Refrigerant

#### 2a. Type d'application (1 choix)

Correspond a `zone_type` dans M2 (F0 — filtre application).

| Application | Gaz suggeres | zone_type M2 |
|-------------|-------------|--------------|
| Chambre froide / Entrepot | CO2, HFC, A2L | `cold_room`, `cold_storage` |
| Salle des machines | CO2, HFC, A2L, NH3, R290 | `machinery_room` |
| Supermarche / Retail | CO2, HFC, A2L | `supermarket` |
| Parking souterrain | CO, NO2 | `parking` |
| VRF / Climatisation (hotel, bureau) | HFC (R410A) | `hotel`, `office` |
| Industriel / Process | NH3, CO2, R290 | `cold_storage`, `machinery_room` |
| Data Center / Salle technique | HFC, A2L, CO2 | `supermarket` (a confirmer) |
| Patinoire / Stade | NH3 | `ice_rink` |
| Pompe a chaleur | R290 | `heat_pump` |
| Zone ATEX | HFC, NH3, HC | `atex_zone` |

#### 2b. Selection du refrigerant (1 seul choix)

Le client choisit **un seul refrigerant** dans la liste filtree par l'application.
Ce choix alimente :
- M1 : lookup DB des proprietes physiques (`safety_class`, `atel_odl`, `lfl`, `vapour_density`, etc.)
- M2 : `selected_refrigerant` → mapping gaz via `REF_TO_GAS` (F3)

| Refrigerant | Code | Classe securite | Densite |
|-------------|------|-----------------|---------|
| Dioxyde de carbone | R-744 | A1 | Lourd |
| R-32 | R-32 | A2L | Leger |
| R-410A | R-410A | A1 | Lourd |
| R-407C | R-407C | A1 | Lourd |
| R-1234yf | R-1234yf | A2L | Lourd |
| R-1234ze(E) | R-1234ze | A2L | Lourd |
| Ammoniac | R-717 | B2L | Leger |
| Propane | R-290 | A3 | Lourd |
| CO (monoxyde) | CO | Toxique | Leger |
| NO2 (dioxyde d'azote) | NO2 | Toxique | Lourd |
| O2 (oxygene) | O2 | — | Leger |

#### 2c. Plage de detection (auto ou manuel)

Pour les refrigerants avec plusieurs plages possibles, le systeme recommande automatiquement selon l'application. Le client peut override.

Correspond a `selected_range` dans M2 (F3b).

---

### Etape 3 — Configuration des Zones

#### Preferences techniques globales (optionnel)

| Parametre | Options | Variable M2 |
|-----------|---------|-------------|
| Tension d'alimentation | Pas de preference, 12V DC, 24V DC, 24V AC/DC, 230V AC | `site_power_voltage` |
| Sortie requise | Relais, 4-20mA, 0-10V, 2-10V, Modbus, Relais+Analog+Modbus, Any | `output_required` |
| Zone ATEX globale | Oui / Non | `zone_atex` |
| Type de montage | Mural, Encastre, Surface, Gaine, Tuyau, Poteau, Rail DIN | `mounting_type_required` |

#### Configuration par zone (repetable)

| Champ | Type | Obligatoire | Exemple | Variable moteur |
|-------|------|:-----------:|---------|-----------------|
| Nom de la zone | texte | oui | Salle des machines | affichage |
| Type de zone | liste | oui | Technique, Stockage, Chambre froide, Public, Parking, Process | M2: `zone_type` |
| Surface (m²) | nombre | oui | 120 | M1: `room_area` |
| Hauteur (m) | nombre | oui | 4.5 | M1: `room_height` |
| Charge refrigerant (kg) | nombre | **oui** | 85 | M1: `refrigerant_charge` |
| Ventilation | liste | oui | Mecanique, Naturelle, Aucune | M1: `mechanical_ventilation_present` |
| Occupation | liste | oui | Permanente, Occasionnelle, Jamais | M1: `is_occupied_space` |
| Zone ATEX | case | non | — | M2: `zone_atex` |
| Categorie d'acces | liste | oui | (a) Public, (b) Autorise, (c) Personnel qualifie | M1: `access_category` |
| Classe de localisation | liste | oui | I Espace occupe, II Piece adjacente, III Salle machines, IV Enceinte ventilee | M1: `location_class` |
| Sous-sol | case | non | — | M1: `below_ground` |
| Salle des machines | case | auto | Pre-coche si type=Technique | M1: `is_machinery_room` |
| Confort humain | case | non | Systeme sert le confort des personnes | M1: `human_comfort` |

> **Note** : `room_volume` est derive automatiquement (surface × hauteur). `c3_applicable` est derive par M1 selon access_category + location_class.

Le client peut ajouter autant de zones que necessaire.

---

### Etape 3b — Contexte commercial (optionnel, pour devis chiffre)

| Champ | Type | Obligatoire | Exemple | Variable M3 |
|-------|------|:-----------:|---------|-------------|
| Groupe client | liste | non | End user, Contractor, Distributeur, OEM | `customer_group` |
| Code remise specifique | texte | non | CUST-FR-042 | `discount_code` |
| Prix projet net (Groupe F) | case | non | — | `project_net_override` |

> Si non rempli, le devis est genere au tarif public (groupe NO = 0% remise).

---

## MOTEURS DE CALCUL (transparent pour le client)

```
Etape 1+2+3                M1                    M2                    M3
    |                       |                     |                     |
    | refrigerant --------->| lookup DB props     |                     |
    | zone config --------->| EN 378 decision     |                     |
    |                       |                     |                     |
    |                       | recommended_        |                     |
    |                       | detectors --------->| = total_detectors   |
    |                       |                     |                     |
    | zone_type, country -->|                     |                     |
    | output, power ------->|                     |                     |
    | refrigerant --------->|                     |                     |
    |                       |                     | F0→F12 selection    |
    |                       |                     | 3 tiers BOM ------->|
    |                       |                     |                     |
    | customer_group ------>|                     |                     |
    |                       |                     |                     | P1-P5 pricing
    |                       |                     |                     | = QUOTE
```

### M1 — Detection Requirement (EN 378)
- Detection requise ? (OUI / NON / REVUE MANUELLE)
- Nombre de detecteurs (min normatif + recommande)
- Hauteur de placement (sol / plafond / zone respiration)
- Seuil d'alarme normatif (ppm)

### M2 — Product Selection (13 fonctions)
- Filtre les produits SAMON compatibles
- Genere 3 tiers de solutions : **PREMIUM / STANDARD / CENTRALIZED**
- Chaque tier = BOM complet (detecteurs, controleur, alarmes, accessoires, prix)

### M3 — Pricing (5 fonctions)
- Valide les prix contre la DB SAMON
- Applique la matrice de remise selon le groupe client
- Genere le devis chiffre HT par tier

---

## OUTPUTS CLIENT (Etape 4 — Resultats)

### 1. En-tete projet

| KPI | Exemple |
|-----|---------|
| Refrigerant | R-744 — Dioxyde de carbone |
| Classe de securite | A1 |
| Detection requise | OUI — Salle des machines EN 378-3 §9.1 |
| Nombre total de detecteurs | 6 |
| Nombre de zones | 2 |
| Prix a partir de | 2 850 EUR HT |

### 2. Badge conformite (de M1)

| Decision M1 | Couleur | Affichage client |
|-------------|---------|------------------|
| `YES` | Vert | Detection obligatoire — conforme EN 378 |
| `YES` + review_flags | Orange | Detection obligatoire — points d'attention |
| `MANUAL_REVIEW` | Jaune | Revue technique necessaire — contactez SAMON |
| `NO` | Gris | Detection non requise par la norme |

Informations complementaires affichees :
- Hazard : Toxicite / Inflammabilite / Les deux
- Seuil d'alarme : `threshold_ppm` ppm (base : `threshold_basis`)
- Clauses normatives utilisees

### 3. Detail par zone

Pour chaque zone, une fiche affiche :

| Information | Source | Exemple |
|-------------|--------|---------|
| Nom de la zone | Client | Salle des machines |
| Badge risque | M1 | OUI — Obligatoire |
| Nombre de detecteurs | M1 | 3 (min: 2, recommande: 3) |
| Refrigerant | Client | R-744 |
| Charge | Client | 85 kg |
| Volume | Derive | 540 m³ (120 × 4.5) |
| Concentration | M1 | 157 g/m³ |
| Position detecteur | M1 | BAS (sol, 0-0.5m) — gaz lourd |
| Seuil alarme | M1 | 36 087 ppm (25% LFL) |
| ATEX requis | Client | Non |

### 4. Propositions (3 tiers cote a cote)

| Element | PREMIUM | STANDARD | CENTRALIZED |
|---------|---------|----------|-------------|
| Detecteur | MIDI CO2 IR | G-Series CO2 IR | TR-IR + MPU4C |
| Technologie | IR (7-10 ans) | IR (7-10 ans) | IR (7-10 ans) |
| Controleur | — (standalone) | — (standalone) | MPU4C |
| Alarme | Incluse (relais) | Incluse (relais) | Via controleur |
| Score qualite | 18/21 | 14/21 | 8/21 |
| **Prix total HT** | **3 420 EUR** | **2 850 EUR** | **2 150 EUR** |
| Remise appliquee | 50% (2 Fö) | 50% (2 Fö) | 45% (2 Fö) |
| Economie vs Premium | — | -17% | -37% |

> **Recommandation automatique** : STANDARD (meilleur rapport qualite/prix)
> Le tier CENTRALIZED n'apparait que si plus de 1 detecteur.

#### Tableau BOM par tier (depliable)

| Reference | Produit | Categorie | Qte | Prix unitaire | Remise | Net |
|-----------|---------|-----------|:---:|:-------------:|:------:|:---:|
| 31-210-32 | MIDI CO2 IR Standalone | Detecteur | 4 | 450 EUR | 50% | 900 EUR |
| 31-400-01 | Flash Light + Siren | Alarme | 2 | 120 EUR | 56% | 106 EUR |
| 31-500-03 | Power Adapter 4000-0002 | Alimentation | 4 | 99 EUR | 50% | 198 EUR |
| — | DT300 Service Tool | Outil (rec.) | 1 | 320 EUR | 56% | 141 EUR |
| — | — | **TOTAL HT** | — | — | — | **1 345 EUR** |

### 5. Notes techniques (section depliable)

- **Trace de calcul M1** : chemin de decision, clauses EN 378 utilisees, formules
- **Hypotheses** : liste des `assumptions[]` de M1 (ex: "100% charge release")
- **Points d'attention** : liste des `review_flags[]` de M1
- Tableau concentration par zone (si charge fournie) :

| Zone | Charge (kg) | Volume (m³) | Concentration | PL | ATEL/2 | 25% LFL | Statut |
|------|:-----------:|:-----------:|:-------------:|:--:|:------:|:-------:|:------:|
| Salle machines | 85 | 540 | 157 g/m³ | 6.5 g/m³ | 40 g/m³ | — | Detection obligatoire |

- Disclaimer : *"Dimensionnement conforme EN 378:2016+A1:2020. Valeurs indicatives — ne remplace pas une etude technique complete par un professionnel qualifie."*

### 6. Actions disponibles

| Bouton | Action |
|--------|--------|
| Modifier zones | Retour a l'etape 3 |
| Modifier client/remise | Retour a l'etape 3b |
| Telecharger PDF | Devis formate avec BOM + conformite |
| Envoyer par email | Email avec PDF au client |
| Nouveau calcul | Recommencer depuis zero |

---

## PERSISTANCE — Devis en base

Chaque calcul genere un devis enregistre automatiquement :

| Champ | Exemple | Source |
|-------|---------|--------|
| Reference | DET-2026-0042 | M3 auto-genere |
| Statut | new / sent / accepted / rejected / expired | Workflow |
| Client (JSON) | Prenom, nom, societe, email, tel | Etape 1 |
| Projet (JSON) | Nom, pays, refrigerant, notes | Etape 1+2 |
| Selections (JSON) | Application, refrigerant, preferences, zones | Etape 2+3 |
| M1 Result (JSON) | detection_required, detectors, thresholds, placement | M1 output |
| M2 Result (JSON) | 3 tiers BOM (PREMIUM/STANDARD/CENTRALIZED) | M2 output |
| M3 Result (JSON) | Devis chiffre, remises, totaux HT | M3 output |
| Trace (JSON) | TraceResult complet (audit) | Trace Engine |
| Total HT | 2 850 EUR | M3 (tier recommande) |
| Price list version | 2026-R2 | M3 (verrouille) |
| Date creation | 2026-04-03 | Auto |
| Valide jusqu'au | 2026-05-03 | +30 jours |

---

## SCHEMA FLUX COMPLET

```
CLIENT                              SYSTEME                              CLIENT
  |                                    |                                    |
  |  Etape 1: Info site + client       |                                    |
  |---------------------------------->|                                    |
  |  Etape 2: Application + Refrigerant (1 seul)                           |
  |---------------------------------->|                                    |
  |  Etape 3: Zones (repetable)       |                                    |
  |      + Preferences techniques     |                                    |
  |      + Contexte commercial (opt.) |                                    |
  |---------------------------------->|                                    |
  |                                    |                                    |
  |                                    |  M1: Detection Requirement         |
  |                                    |  → YES/NO/MANUAL_REVIEW            |
  |                                    |  → nb detecteurs, placement, seuil |
  |                                    |                                    |
  |                                    |  M2: Product Selection              |
  |                                    |  → 3 tiers BOM (PREM/STD/CENTR)   |
  |                                    |  → scoring, architecture           |
  |                                    |                                    |
  |                                    |  M3: Pricing                       |
  |                                    |  → remises, totaux HT par tier     |
  |                                    |  → cross-validation prix           |
  |                                    |                                    |
  |                                    |  Sauvegarde devis + trace en DB    |
  |                                    |                                    |
  |                                    |---------------------------------->|
  |                                    |  Etape 4: Resultats                |
  |                                    |  - En-tete + KPIs                  |
  |                                    |  - Badge conformite (M1)           |
  |                                    |  - Detail par zone                 |
  |                                    |  - 3 tiers cote a cote + BOM      |
  |                                    |  - Notes techniques + trace        |
  |                                    |  - PDF / Email / Modifier          |
```
