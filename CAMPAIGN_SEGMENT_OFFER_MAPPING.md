# Campaign-Segment-Offer Mapping - Guide d'Implémentation

## 🎯 Vue d'Ensemble

Ce document décrit l'implémentation complète du système de mapping Campaign-Segment-Offer pour les campagnes de type **Multiple Target Group**.

## 📋 Architecture

### 1. Service API

**Fichier:** `campaignSegmentOfferService.ts`

```typescript
// Créer un mapping
createMapping(mapping: CampaignSegmentOfferMapping)

// Créer plusieurs mappings en batch
createBatchMappings(mappings: CampaignSegmentOfferMapping[])

// Récupérer les mappings d'un segment
getMappingsBySegment(segmentId: string)

// Supprimer un mapping
deleteMapping(id: number)
```

**Format de données:**
```typescript
{
  campaign_id: number;
  segment_id: string;
  offer_id: number;
  created_by: number;
}
```

### 2. Composants UI

#### MultipleTargetOfferMapping.tsx
Composant spécialisé pour le type "Multiple Target Group" qui:
- Affiche tous les segments sélectionnés
- Permet d'ajouter des offres à chaque segment
- Affiche les offres mappées avec option de retrait
- Stocke les mappings dans `segmentOfferMappings` state

#### OfferMappingStep.tsx
Composant principal qui:
- Gère différents types de campagnes
- Utilise `MultipleTargetOfferMapping` pour le type "multiple_target_group"
- Reçoit et transmet les props `segmentOfferMappings` et `setSegmentOfferMappings`

### 3. Flow de Création

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Definition                                      │
│ - Nom: "fra"                                            │
│ - Type: "multiple_target_group" (Important!)           │
│ - Objectif: "New Customer Acquisition"                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Audience                                        │
│ - Sélectionner segment: "Frank" (14,777 customers)     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Offers                                          │
│ - Affichage segment "Frank"                            │
│ - Cliquer "Add Offer"                                   │
│ - Sélectionner offre(s)                                 │
│ - Mapping créé: { segment_id: "frank_id", offer_id: X }│
│                                                         │
│ ⚠️ IMPORTANT: Tous les segments doivent avoir au      │
│    moins une offre mappée pour passer au Preview       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: Preview                                         │
│ - Réviser toutes les informations                      │
│ - Cliquer "Create Campaign"                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ handleSubmit() - CreateCampaignPage.tsx                 │
│                                                         │
│ 1. POST /campaigns                                      │
│    → Crée la campagne                                   │
│    → Reçoit campaign_id                                 │
│                                                         │
│ 2. Si campaign_type === 'multiple_target_group'        │
│    ET segmentOfferMappings.length > 0                   │
│    → Appelle createBatchMappings()                      │
│                                                         │
│ 3. Pour chaque mapping:                                 │
│    POST /campaign-segment-offers                        │
│    {                                                    │
│      campaign_id: [ID de la campagne créée],           │
│      segment_id: "frank_id",                            │
│      offer_id: 123,                                     │
│      created_by: 1                                      │
│    }                                                    │
│                                                         │
│ 4. Affiche success ou warning selon résultat            │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Vérification & Debug

### Console Logs à vérifier

Ouvrez la console du navigateur (F12) et cherchez:

1. **Lors de la création:**
```javascript
Creating campaign: { request, url }
Campaign created: response
Campaign created with ID: [number]
Creating segment-offer mappings: [array of mappings]
Mapping created: { success, data }
Segment-offer mappings created successfully
```

2. **Structure des mappings:**
```javascript
segmentOfferMappings: [
  { segment_id: "123", offer_id: 456 },
  { segment_id: "123", offer_id: 789 }
]
```

### Checklist de Débogage

- [ ] Le type de campagne est bien "multiple_target_group" (vérifier dans Step 1)
- [ ] Au moins un segment est sélectionné dans Step 2
- [ ] Chaque segment a au moins une offre mappée dans Step 3
- [ ] Le state `segmentOfferMappings` contient les mappings (vérifier dans React DevTools)
- [ ] La campagne est créée avec succès (vérifier la réponse de l'API)
- [ ] L'ID de la campagne est récupéré correctement
- [ ] Les appels POST /campaign-segment-offers sont effectués
- [ ] Toast de confirmation s'affiche

### Endpoints API Utilisés

```http
# Créer une campagne
POST /campaigns
Content-Type: application/json
{
  "name": "fra",
  "code": "FRA_2025_ABCD",
  "objective": "acquisition",
  "created_by": 1,
  "category_id": 1
}

# Créer un mapping segment-offre
POST /campaign-segment-offers
Content-Type: application/json
{
  "campaign_id": 1,
  "segment_id": "frank_id",
  "offer_id": 9,
  "created_by": 1
}

# Récupérer les mappings d'un segment
GET /campaign-segment-offers/segment/{segment_id}
```

## 🐛 Problèmes Courants

### 1. Les mappings ne sont pas créés
**Cause:** Le type de campagne n'est pas "multiple_target_group"
**Solution:** Dans Step 1, vérifier que le campaign_type est bien défini

### 2. Validation échoue au Step 3
**Cause:** Pas tous les segments ont des offres mappées
**Solution:** Ajouter au moins une offre à chaque segment

### 3. API retourne une erreur
**Cause:** campaign_id invalide ou segment_id/offer_id inexistant
**Solution:** Vérifier les IDs dans la console et la base de données

### 4. segmentOfferMappings est vide
**Cause:** Le composant MultipleTargetOfferMapping ne met pas à jour le state
**Solution:** Vérifier que setSegmentOfferMappings est bien passé en props

## ✅ Test Manuel

1. Créer une nouvelle campagne
2. Sélectionner type "Multiple Target" (important!)
3. Sélectionner un segment (ex: "Frank")
4. Dans Offers step, cliquer "Add Offer" pour le segment
5. Sélectionner une offre
6. Vérifier que l'offre apparaît sous le segment
7. Aller au Preview
8. Cliquer "Create Campaign"
9. Ouvrir F12 → Console
10. Vérifier les logs de création de mappings
11. Vérifier le toast de confirmation

## 📊 État Final Attendu

```javascript
// Dans CreateCampaignPage state
formData: {
  name: "fra",
  campaign_type: "multiple_target_group",
  objective: "acquisition",
  category_id: 1
}

selectedSegments: [
  { id: "123", name: "Frank", customer_count: 14777 }
]

segmentOfferMappings: [
  { segment_id: "123", offer_id: 456 }
]

// Après création campagne
Response: {
  success: true,
  data: { id: 1, name: "fra", ... }
}

// Mappings créés
[
  {
    id: 1,
    campaign_id: 1,
    segment_id: "123",
    offer_id: 456,
    created_at: "2025-11-09T...",
    created_by: 1
  }
]
```

## 🔄 Prochaines Étapes

1. Tester la création de campagne avec plusieurs segments
2. Tester avec plusieurs offres par segment
3. Implémenter la récupération des mappings pour l'édition
4. Ajouter la gestion des erreurs détaillées
5. Implémenter les autres types de campagnes (Champion-Challenger, A/B Test)
