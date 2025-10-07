# Campaign Types - Documentation CVM

## Vue d'ensemble

Le système de gestion des campagnes supporte **5 types de campagnes** différents, chacun avec ses propres caractéristiques et flux de configuration.

---

## 1. Multiple Target Group

### Description
Type de campagne standard permettant de cibler plusieurs segments distincts avec différentes offres.

### Fonctionnalités
- ✅ Création de plusieurs segments
- ✅ Mapping d'offres multiples à chaque segment
- ✅ Configuration de Control Group par segment
- ✅ Priorisation des segments (drag & drop)
- ✅ Option de segments mutuellement exclusifs

### Cas d'usage
- Campagnes multi-segments standards
- Ciblage de différents profils clients avec des offres adaptées
- Campagnes de rétention avec plusieurs niveaux de clientèle

### Configuration
**Étape Audience:**
- Sélection de N segments (N ≥ 1)
- Chaque segment peut avoir son propre Control Group
- Option de mutual exclusivity entre segments

**Étape Offer Mapping:**
- Chaque segment peut recevoir une ou plusieurs offres
- Association libre offres ↔ segments

---

## 2. Champion-Challenger

### Description
Type de campagne pour tester des variantes (challengers) contre une stratégie principale (champion).

### Fonctionnalités
- ✅ Un segment Champion principal
- ✅ Plusieurs segments Challengers (sous-segments du Champion)
- ✅ Control Group configurable sur chaque segment
- ✅ Badges visuels Champion 🏆 / Challenger

### Cas d'usage
- Test de nouvelles stratégies d'offres
- Optimisation d'un segment existant
- A/B/n testing avec un groupe de référence

### Configuration
**Étape Audience:**
- 1er segment = Champion (badge 🏆)
- Segments suivants = Challengers (liés au Champion)
- Les Challengers sont des sous-segments du Champion

**Étape Offer Mapping:**
- x + 1 segments à mapper (x challengers + 1 champion)
- Chaque segment (Champion et Challengers) reçoit ses offres

---

## 3. A/B Test

### Description
Type de campagne pour comparer exactement **deux** variantes A et B.

### Fonctionnalités
- ✅ Exactement 2 segments (A et B)
- ✅ Badges visuels distincts (Variant A en bleu, Variant B en violet)
- ✅ Control Group configurable
- ✅ Limitation stricte à 2 segments

### Cas d'usage
- Tests A/B classiques
- Comparaison de deux offres ou messages
- Split testing simple

### Configuration
**Étape Audience:**
- Segment 1 = Variant A (badge bleu)
- Segment 2 = Variant B (badge violet)
- Impossible d'ajouter plus de 2 segments

**Étape Offer Mapping:**
- 2 segments à mapper uniquement
- Chaque variant reçoit ses offres spécifiques

---

## 4. Round Robin

### Description
Type de campagne avec **un seul segment** recevant plusieurs offres de manière séquentielle, avec des **intervalles de temps** entre chaque offre.

### Fonctionnalités
- ✅ Un seul segment cible
- ✅ Offres multiples en séquence
- ✅ Configuration d'intervalles temporels (heures/jours/semaines)
- ✅ Interface FlowChart pour visualiser la séquence
- ✅ Control Group configurable

### Cas d'usage
- Campagnes de nurturing progressif
- Séquences d'onboarding
- Campagnes de réactivation en plusieurs étapes

### Configuration
**Étape Audience:**
- 1 segment unique

**Étape Offer Mapping:**
- Interface FlowChart avec timeline visuelle
- Chaque offre a un **IntervalConfig**:
  - `interval_type`: hours | days | weeks
  - `interval_value`: nombre d'unités
  - `description`: description optionnelle

**Exemple de flux:**
```
START → Segment
  ↓ (Wait 1 day)
Offer 1: Welcome Bonus
  ↓ (Wait 3 days)
Offer 2: Product Discovery
  ↓ (Wait 7 days)
Offer 3: Premium Upgrade
  ↓
END
```

---

## 5. Multiple Level

### Description
Type de campagne avec **un seul segment** recevant plusieurs offres de manière séquentielle, basées sur des **conditions** plutôt que des intervalles de temps.

### Fonctionnalités
- ✅ Un seul segment cible
- ✅ Offres multiples conditionnelles
- ✅ Configuration de conditions logiques
- ✅ Interface FlowChart pour visualiser la logique
- ✅ Control Group configurable

### Cas d'usage
- Campagnes comportementales
- Offres basées sur l'engagement
- Parcours clients personnalisés

### Configuration
**Étape Audience:**
- 1 segment unique

**Étape Offer Mapping:**
- Interface FlowChart avec logique conditionnelle
- Chaque offre a un **ConditionConfig**:
  - `condition_type`: customer_attribute | behavior | transaction | custom
  - `operator`: equals | not_equals | greater_than | less_than | contains | not_contains
  - `field`: nom du champ à évaluer
  - `value`: valeur de comparaison
  - `description`: description optionnelle

**Exemple de flux:**
```
START → Segment
  ↓ (If email_opened = true)
Offer 1: First Purchase Bonus
  ↓ (If purchase_amount > 100)
Offer 2: Premium Member Offer
  ↓ (If tier_level = "gold")
Offer 3: VIP Exclusive
  ↓
END
```

---

## Composants Techniques

### Types TypeScript

#### `CampaignType`
```typescript
export type CampaignType = 
  | 'multiple_target_group' 
  | 'champion_challenger' 
  | 'ab_test' 
  | 'round_robin' 
  | 'multiple_level';
```

#### `CampaignSegment` (extensions)
```typescript
export interface CampaignSegment {
  // ... fields de base
  
  // Pour Champion-Challenger
  is_champion?: boolean;
  parent_segment_id?: string; // Pour les challengers
  
  // Pour A/B Test
  ab_variant?: 'A' | 'B';
}
```

#### `IntervalConfig` (Round Robin)
```typescript
export interface IntervalConfig {
  interval_type: 'hours' | 'days' | 'weeks';
  interval_value: number;
  description?: string;
}
```

#### `ConditionConfig` (Multiple Level)
```typescript
export interface ConditionConfig {
  condition_type: 'customer_attribute' | 'behavior' | 'transaction' | 'custom';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  field: string;
  value: string | number | boolean;
  description?: string;
}
```

#### `SequentialOfferMapping` (Round Robin & Multiple Level)
```typescript
export interface SequentialOfferMapping {
  offer_id: string;
  segment_id: string;
  sequence_order: number;
  interval_config?: IntervalConfig; // Pour Round Robin
  condition_config?: ConditionConfig; // Pour Multiple Level
}
```

### Composants React

#### `AudienceConfigurationStep`
- Gère la sélection du type de campagne
- Adapte l'UI selon le type choisi
- Affiche les badges appropriés (Champion, Challenger, A, B)
- Contrôle le nombre de segments selon le type

#### `OfferMappingStep`
- Affiche l'interface standard pour Multiple Target, Champion-Challenger, A/B Test
- Affiche le FlowChart pour Round Robin et Multiple Level
- Gère les mappings différemment selon le type

#### `OfferFlowChart`
- Composant visuel pour Round Robin et Multiple Level
- Timeline verticale avec START/END
- Configuration inline des intervalles ou conditions
- Drag & drop implicite via ordre de séquence

---

## Control Groups

**Tous les types de campagnes** supportent la configuration de Control Groups au niveau des segments via le bouton **Settings** ⚙️.

### Options de Control Group
1. **No Control Group**: Tous les clients reçoivent la campagne
2. **With Control Group**:
   - Fixed Percentage
   - Fixed Number
   - Advanced Parameters (confidence level + margin of error)
3. **Universal Control Group**: Sélection d'un groupe de contrôle pré-configuré

---

## Palette de Couleurs

Le système utilise une palette cohérente et professionnelle:

- **Primary**: `#588157` (vert moyen)
- **Primary Hover**: `#3A5A40` (vert foncé)
- **Primary Light**: `#A3B18A` (vert clair)
- **Secondary**: `#344E41` (vert très foncé)
- **Neutral**: `#DAD7CD` (beige clair)

### Badges de Type
- **Champion**: `#588157` (vert) avec emoji 🏆
- **Challenger**: `#A3B18A` (vert clair)
- **Variant A**: `#3B82F6` (bleu)
- **Variant B**: `#A855F7` (violet)

---

## Validation

### Règles de validation par type

**Multiple Target Group:**
- ✅ Au moins 1 segment
- ✅ Chaque segment doit avoir au moins 1 offre mappée

**Champion-Challenger:**
- ✅ Au moins 1 Champion
- ✅ Peut avoir 0 ou plusieurs Challengers
- ✅ Chaque segment doit avoir au moins 1 offre mappée

**A/B Test:**
- ✅ Exactement 2 segments (A et B)
- ✅ Chaque variant doit avoir au moins 1 offre mappée

**Round Robin:**
- ✅ Exactement 1 segment
- ✅ Au moins 1 offre dans la séquence
- ✅ Chaque offre doit avoir un IntervalConfig valide

**Multiple Level:**
- ✅ Exactement 1 segment
- ✅ Au moins 1 offre dans la séquence
- ✅ Chaque offre doit avoir un ConditionConfig valide

---

## Notes d'implémentation

### Performance
- Les FlowCharts sont optimisés pour des séquences de 10-20 offres
- Pour des séquences plus longues, considérer la pagination

### UX/UI
- Design épuré et professionnel
- Pas de couleurs extravagantes
- Boutons Settings ⚙️ discrets mais accessibles
- Feedback visuel clair (badges, couleurs, icônes)

### Extensibilité
Le système est conçu pour être facilement extensible:
- Ajout de nouveaux types de campagnes
- Nouveaux types de conditions pour Multiple Level
- Nouveaux intervalles pour Round Robin
