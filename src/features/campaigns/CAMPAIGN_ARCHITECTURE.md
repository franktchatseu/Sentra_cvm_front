# Architecture des Types de Campagnes CVM

## 🏗️ Structure Discriminée (Discriminated Union)

La nouvelle architecture utilise TypeScript Discriminated Union pour une gestion type-safe des campagnes.

### Base Campaign Interface

```typescript
interface CampaignBase {
  id: string;
  name: string;
  description?: string;
  primary_objective: 'acquisition' | 'retention' | 'churn_prevention' | 'upsell_cross_sell' | 'reactivation';
  category: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  created_by: string;
  start_date?: string;
  end_date?: string;
  scheduling: CampaignScheduling;
  approval_workflow?: ApprovalWorkflow;
  is_definitive?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}
```

### Types Spécialisés

#### 1. Multiple Target Group Campaign
```typescript
export interface MultipleTargetGroupCampaign extends CampaignBase {
  campaign_type: 'multiple_target_group';
  config: {
    segments: CampaignSegment[];
    offer_mappings: CampaignOfferMapping[];
    mutually_exclusive?: boolean;
  };
}
```

**Caractéristiques:**
- Plusieurs segments indépendants
- Offres mappées individuellement à chaque segment
- Option d'exclusivité mutuelle

---

#### 2. Champion-Challenger Campaign
```typescript
export interface ChampionChallengerCampaign extends CampaignBase {
  campaign_type: 'champion_challenger';
  config: {
    champion: CampaignSegment;       // Le segment champion
    challengers: CampaignSegment[];  // Les segments challengers
    offer_mappings: CampaignOfferMapping[];
  };
}
```

**Caractéristiques:**
- Structure claire Champion vs Challengers
- 1 Champion obligatoire (segment de référence)
- N Challengers (variantes à tester)
- Identification via `priority`: 1 = Champion, >1 = Challengers

---

#### 3. A/B Test Campaign
```typescript
export interface ABTestCampaign extends CampaignBase {
  campaign_type: 'ab_test';
  config: {
    variant_a: CampaignSegment;      // Variante A
    variant_b: CampaignSegment;      // Variante B
    offer_mappings: CampaignOfferMapping[];
  };
}
```

**Caractéristiques:**
- Exactement 2 variants (A et B)
- Structure symétrique pour comparaison
- Identification claire des deux branches du test

---

#### 4. Round Robin Campaign
```typescript
export interface RoundRobinCampaign extends CampaignBase {
  campaign_type: 'round_robin';
  config: {
    segment: CampaignSegment;        // Segment unique
    offer_sequence: SequentialOfferMapping[];
  };
}
```

**Caractéristiques:**
- 1 seul segment cible
- Offres séquentielles avec intervalles temporels
- Configuration via `IntervalConfig` (hours/days/weeks)

---

#### 5. Multiple Level Campaign
```typescript
export interface MultipleLevelCampaign extends CampaignBase {
  campaign_type: 'multiple_level';
  config: {
    segment: CampaignSegment;        // Segment unique
    offer_sequence: SequentialOfferMapping[];
  };
}
```

**Caractéristiques:**
- 1 seul segment cible
- Offres séquentielles avec conditions logiques
- Configuration via `ConditionConfig` (field, operator, value)

---

### Union Type

```typescript
export type Campaign = 
  | MultipleTargetGroupCampaign 
  | ChampionChallengerCampaign 
  | ABTestCampaign 
  | RoundRobinCampaign 
  | MultipleLevelCampaign;
```

Cette union permet à TypeScript de garantir la cohérence des données selon le type de campagne.

---

## 🎨 Composants d'Affichage Spécialisés

### 1. ChampionChallengerDisplay.tsx

**Responsabilité:** Affichage dédié pour les campagnes Champion-Challenger

**Design:**
- Section Champion avec badge 🏆 vert (`#588157`)
- Grille de Challengers avec numérotation C1, C2, C3...
- Boutons Settings ⚙️ pour Control Group
- Stats: Total Audience, nombre de challengers
- Layout: Champion en haut, Challengers en grille 2 colonnes

**Props:**
```typescript
{
  champion: CampaignSegment | null;
  challengers: CampaignSegment[];
  onAddChampion: () => void;
  onAddChallenger: () => void;
  onRemoveSegment: (id: string) => void;
  onConfigureControlGroup: (id: string) => void;
}
```

---

### 2. ABTestDisplay.tsx

**Responsabilité:** Affichage symétrique pour les tests A/B

**Design:**
- Grille 2 colonnes égales (50/50)
- Variant A: Bleu (`#3B82F6`)
- Variant B: Violet (`#A855F7`)
- Indicateur de split ratio
- Comparaison visuelle "VS" au centre
- Stats par variant

**Props:**
```typescript
{
  variantA: CampaignSegment | null;
  variantB: CampaignSegment | null;
  onAddVariant: (variant: 'A' | 'B') => void;
  onRemoveSegment: (id: string) => void;
  onConfigureControlGroup: (id: string) => void;
}
```

---

### 3. SequentialCampaignDisplay.tsx

**Responsabilité:** Affichage pour Round Robin et Multiple Level

**Design:**
- Bannière d'information du type (Round Robin ou Multiple Level)
- 1 seul segment affiché de manière proéminente
- Badge "TARGET" vert
- Info contextuelle pour l'étape suivante
- Gradient amber/orange pour différencier

**Props:**
```typescript
{
  campaignType: 'round_robin' | 'multiple_level';
  segment: CampaignSegment | null;
  onAddSegment: () => void;
  onRemoveSegment: (id: string) => void;
  onConfigureControlGroup: (id: string) => void;
}
```

---

## 🎯 Identification des Segments

### Méthode par Priority

Au lieu d'utiliser des flags booléens (`is_champion`, `ab_variant`), l'identification se fait via le champ `priority`:

**Champion-Challenger:**
- `priority === 1` → Champion
- `priority > 1` → Challengers

**A/B Test:**
- `priority === 1` → Variant A
- `priority === 2` → Variant B

**Avantages:**
- Plus simple et cohérent
- Facilite le tri et l'ordonnancement
- Évite la prolifération de champs spécifiques

---

## 🎨 Palette de Couleurs

### Couleurs Principales
```css
--primary: #588157      /* Vert moyen */
--primary-hover: #3A5A40  /* Vert foncé */
--primary-light: #A3B18A  /* Vert clair */
--secondary: #344E41    /* Vert très foncé */
--neutral: #DAD7CD      /* Beige clair */
```

### Couleurs par Type

**Champion-Challenger:**
- Champion: `#588157` (vert primaire)
- Challengers: `#A3B18A` (vert clair)

**A/B Test:**
- Variant A: `#3B82F6` (bleu)
- Variant B: `#A855F7` (violet)

**Round Robin / Multiple Level:**
- Gradient: Amber (`#F59E0B`) to Orange (`#F97316`)

---

## 📋 Validation par Type

### Multiple Target Group
```typescript
✓ Au moins 1 segment
✓ Chaque segment a au moins 1 offre mappée
```

### Champion-Challenger
```typescript
✓ Exactement 1 Champion (priority === 1)
✓ 0 ou N Challengers (priority > 1)
✓ Chaque segment a au moins 1 offre
```

### A/B Test
```typescript
✓ Exactement 2 segments
✓ variant_a (priority === 1)
✓ variant_b (priority === 2)
✓ Chaque variant a au moins 1 offre
```

### Round Robin
```typescript
✓ Exactement 1 segment
✓ Au moins 1 offre dans offer_sequence
✓ Chaque offre a un IntervalConfig valide
```

### Multiple Level
```typescript
✓ Exactement 1 segment
✓ Au moins 1 offre dans offer_sequence
✓ Chaque offre a un ConditionConfig valide
```

---

## 🔄 Flow d'Utilisation

### 1. Sélection du Type (AudienceConfigurationStep)
```
[Multiple Target] [Champion-Challenger] [A/B Test] [Round Robin] [Multiple Level]
        ↓
    Display approprié s'affiche automatiquement
```

### 2. Configuration des Segments
```
Champion-Challenger → ChampionChallengerDisplay
A/B Test           → ABTestDisplay
Round Robin        → SequentialCampaignDisplay
Multiple Level     → SequentialCampaignDisplay
Multiple Target    → Standard segment list
```

### 3. Mapping des Offres (OfferMappingStep)
```
Champion-Challenger, A/B Test, Multiple Target → Standard mapping
Round Robin, Multiple Level                    → OfferFlowChart
```

---

## 🚀 Avantages de cette Architecture

### 1. Type Safety
- TypeScript garantit la cohérence des données
- Impossible d'avoir un Champion sans Challengers dans le type
- Auto-complétion intelligente

### 2. Clarté
- Structure explicite pour chaque type
- Plus besoin de deviner quels champs sont utilisés
- Documentation auto-générée par les types

### 3. Maintenabilité
- Ajout facile de nouveaux types
- Modifications isolées par type
- Tests unitaires plus simples

### 4. UI/UX
- Composants spécialisés = meilleure expérience
- Design adapté à chaque cas d'usage
- Feedback visuel clair

### 5. Performance
- Rendu conditionnel optimisé
- Pas de calculs inutiles
- Composants légers et ciblés

---

## 📦 Fichiers Créés

```
src/features/campaigns/
├── types/
│   └── campaign.ts                    # Types restructurés avec union
├── components/
│   ├── displays/
│   │   ├── ChampionChallengerDisplay.tsx  # Display Champion-Challenger
│   │   ├── ABTestDisplay.tsx              # Display A/B Test
│   │   └── SequentialCampaignDisplay.tsx  # Display Round Robin/Multiple Level
│   └── steps/
│       ├── AudienceConfigurationStep.tsx  # Intègre les displays
│       ├── OfferMappingStep.tsx          # Gère les différents types
│       └── OfferFlowChart.tsx            # FlowChart pour séquentiels
└── docs/
    ├── CAMPAIGN_TYPES_DOCUMENTATION.md    # Documentation complète
    └── CAMPAIGN_ARCHITECTURE.md           # Ce fichier
```

---

## 🎯 Prochaines Évolutions Possibles

1. **Visualisation des Performances**
   - Dashboard comparatif Champion vs Challengers
   - Graphiques de conversion A vs B
   - Timeline des offres Round Robin

2. **Templates Prédéfinis**
   - Templates de Champion-Challenger communs
   - Scénarios A/B Test typiques
   - Séquences Round Robin recommandées

3. **Analytics Avancées**
   - Statistical significance pour A/B Tests
   - Attribution modeling pour Multiple Level
   - Lift analysis pour Champion-Challenger

4. **Optimisations IA**
   - Auto-suggestion de challengers
   - Prédiction de performance par variant
   - Optimisation automatique des intervalles

---

## ✅ Checklist de Qualité

- ✅ Type safety complet avec TypeScript
- ✅ UI épurée et professionnelle
- ✅ Palette de couleurs cohérente
- ✅ Composants réutilisables et maintenables
- ✅ Documentation exhaustive
- ✅ Validation robuste par type
- ✅ Performance optimisée
- ✅ Accessibilité (Settings toujours visible)
- ✅ Feedback visuel clair (badges, couleurs)
- ✅ Architecture extensible
