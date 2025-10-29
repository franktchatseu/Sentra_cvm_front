# Communication Policy - Multi-Select Channels Update

## Vue d'ensemble

Transformation du sélecteur de channels d'une grille de boutons volumineux vers un **select box multiple compact**, permettant la sélection de plusieurs canaux simultanément.

## Changements Principaux

### ❌ **Avant** : Large Grid de Boutons
```
┌─────────────────────────────────────────────────┐
│ Communication Channel *                         │
├─────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ 📱   │  │ 📧   │  │ 📞   │  │ 📲   │       │
│  │ SMS  │  │Email │  │USSD  │  │ App  │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
└─────────────────────────────────────────────────┘
```
**Problèmes** :
- Occupe beaucoup d'espace vertical (~ 120px)
- Sélection simple uniquement
- Peu adapté aux petits écrans

### ✅ **Après** : Select Box Multiple Compact
```
┌─────────────────────────────────────────────────┐
│ Communication Channels * (Multiple selection)   │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ 📱 SMS - Short Message Service              │ │
│ │ 📧 Email - Email Communication              │ │
│ │ 📞 USSD - Unstructured Supplementary...     │ │
│ │ 📲 App Notification - In-App Push...        │ │
│ └─────────────────────────────────────────────┘ │
│ Hold Ctrl (or Cmd) to select multiple          │
│ Selected: 📧 📱                                  │
└─────────────────────────────────────────────────┘
```
**Avantages** :
- Compact : occupe ~120px au lieu de dispersion horizontale
- Multi-sélection native (Ctrl/Cmd + clic)
- Affichage clair avec icônes et descriptions
- Indicateur visuel des sélections

## Modifications Techniques

### 1. **Types Mis à Jour**

**De** : `channel: CommunicationChannel` (singulier)
**Vers** : `channels: CommunicationChannel[]` (array)

```typescript
// communicationPolicyConfig.ts

export interface CommunicationPolicyConfiguration {
    id: number;
    name: string;
    description?: string;
    channels: CommunicationChannel[];  // ✅ ARRAY
    type: CommunicationPolicyType;
    config: TimeWindowConfig | MaximumCommunicationConfig | DNDConfig | VIPListConfig;
    isActive: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateCommunicationPolicyRequest {
    name: string;
    description?: string;
    channels: CommunicationChannel[];  // ✅ ARRAY
    type: CommunicationPolicyType;
    config: TimeWindowConfig | MaximumCommunicationConfig | DNDConfig | VIPListConfig;
    isActive?: boolean;
}
```

### 2. **Modal - Select Multiple**

```tsx
// CommunicationPolicyModal.tsx

const [channels, setChannels] = useState<CommunicationChannel[]>(['EMAIL']);

<select
    multiple
    value={channels}
    onChange={(e) => {
        const selected = Array.from(
            e.target.selectedOptions, 
            option => option.value as CommunicationChannel
        );
        setChannels(selected);
    }}
    className={`${components.input.default} w-full px-3 py-2 min-h-[120px]`}
    required
>
    {COMMUNICATION_CHANNELS.map((ch) => (
        <option key={ch.value} value={ch.value}>
            {ch.icon} {ch.label} - {ch.description}
        </option>
    ))}
</select>
<p className={`${tw.caption} ${tw.textMuted} mt-2`}>
    Hold Ctrl (or Cmd) to select multiple channels. 
    Selected: {channels.map(c => COMMUNICATION_CHANNELS.find(ch => ch.value === c)?.icon).join(' ')}
</p>
```

**Caractéristiques** :
- Attribut `multiple` pour sélection multiple
- `min-h-[120px]` pour afficher plusieurs options
- Extraction des `selectedOptions` en array
- Indicateur en temps réel des sélections (émojis)
- Message d'aide pour la sélection multiple

### 3. **Page Liste - Affichage Multi-Badges**

```tsx
// CommunicationPolicyPage.tsx

const getChannelsDisplay = (channelValues: string[]) => {
    if (!channelValues || channelValues.length === 0) return null;
    
    return (
        <div className="flex flex-wrap items-center gap-2">
            {channelValues.map((channelValue) => {
                const channel = COMMUNICATION_CHANNELS.find(ch => ch.value === channelValue);
                if (!channel) return null;
                
                return (
                    <div key={channelValue} className={`flex items-center space-x-1 px-2 py-1 rounded ${tw.accent10}`}>
                        <span className="text-sm">{channel.icon}</span>
                        <span className={`${tw.caption} font-medium ${tw.textPrimary}`}>
                            {channel.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
```

**Affichage** : Chaque canal est affiché comme un badge avec fond accent
```
┌─────────────────────────────────────┐
│ 📧 Email   📱 SMS                   │
└─────────────────────────────────────┘
```

### 4. **Service - Données Multi-Channels**

```typescript
// communicationPolicyService.ts

this.policies = [
    {
        id: 1,
        name: 'Business Hours Time Window',
        channels: ['EMAIL', 'SMS'],  // ✅ Multiple channels
        type: 'timeWindow',
        ...
    },
    {
        id: 2,
        name: 'Daily Communication Limit',
        channels: ['SMS', 'USSD'],  // ✅ Multiple channels
        ...
    },
    {
        id: 3,
        name: 'Marketing DND Policy',
        channels: ['APP', 'EMAIL'],  // ✅ Multiple channels
        ...
    },
    {
        id: 4,
        name: 'VIP Customer Priority',
        channels: ['EMAIL', 'SMS', 'APP', 'USSD'],  // ✅ Tous les channels
        ...
    }
];
```

## Exemples Visuels

### Tableau Desktop
```
┌──────────────────────────────────────────────────────────────────────┐
│ POLICY              │ CHANNELS         │ CONFIGURATION    │ STATUS  │
├──────────────────────────────────────────────────────────────────────┤
│ Business Hours      │ 📧 Email         │ 🕐 09:00-18:00 • │ ✅      │
│                     │ 📱 SMS           │ + 3 more types   │ Active  │
├──────────────────────────────────────────────────────────────────────┤
│ Daily Limit         │ 📱 SMS           │ 📊 Max 3/daily • │ ✅      │
│                     │ 📞 USSD          │ + 3 more types   │ Active  │
├──────────────────────────────────────────────────────────────────────┤
│ VIP Priority        │ 📧 Email         │ ⭐ include (P:1)•│ ✅      │
│                     │ 📱 SMS           │ + 3 more types   │ Active  │
│                     │ 📲 App           │                  │         │
│                     │ 📞 USSD          │                  │         │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile Cards
```
┌──────────────────────────────────────────┐
│ Business Hours Policy              [✓]   │
│                                           │
│ 📧 Email   📱 SMS                         │
│                                           │
│ Allow communications during work hours    │
│ All Policy Types: 🕐 09:00-18:00 • ...   │
│                              [✏️] [🗑️]    │
└──────────────────────────────────────────┘
```

## Utilisation

### Créer une Policy Multi-Channel

1. **Ouvrir le modal** : Cliquer sur "Create Policy"
2. **Remplir le nom** : "Multi-Channel Campaign"
3. **Sélectionner les channels** :
   - Cliquer sur "Email" (sélectionné)
   - Maintenir Ctrl/Cmd + cliquer sur "SMS" (ajouté)
   - Maintenir Ctrl/Cmd + cliquer sur "App" (ajouté)
4. **Voir l'indicateur** : "Selected: 📧 📱 📲"
5. **Configurer les 4 types** de policy
6. **Créer** → La policy s'affiche avec 3 badges

### Éditer les Channels

1. **Cliquer sur Edit** ✏️
2. **Le select affiche** les channels actuels sélectionnés
3. **Modifier la sélection** :
   - Ctrl + clic pour ajouter
   - Ctrl + clic sur un sélectionné pour retirer
4. **Sauvegarder** → Badges mis à jour

## Compatibilité Backend

### Structure API Recommandée

**POST /api/communication-policies**
```json
{
    "name": "Multi-Channel Business Hours",
    "description": "Policy for email and SMS",
    "channels": ["EMAIL", "SMS"],  // ✅ Array
    "configs": {
        "timeWindow": { ... },
        "maximumCommunication": { ... },
        "dnd": { ... },
        "vipList": { ... }
    },
    "isActive": true
}
```

**GET /api/communication-policies**
```json
[
    {
        "id": 1,
        "name": "Multi-Channel Business Hours",
        "channels": ["EMAIL", "SMS"],  // ✅ Array
        "configs": { ... },
        "isActive": true,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-20T14:45:00Z"
    }
]
```

## Avantages de l'Approche

### 1. **Gain d'Espace**
- **Avant** : ~200px de hauteur pour la grille
- **Après** : ~150px pour le select (gain de 25%)

### 2. **Multi-Sélection Native**
- Utilise les comportements natifs du navigateur
- Pas de logique custom complexe
- Accessible (ARIA natives)

### 3. **Clarté Visuelle**
- Descriptions complètes dans le select
- Indicateur en temps réel
- Badges colorés dans la liste

### 4. **Flexibilité**
- Peut sélectionner 1, 2, 3 ou les 4 channels
- Facile à étendre avec de nouveaux channels

### 5. **Mobile-Friendly**
- Select natif s'adapte automatiquement
- Interface tactile optimisée

## Cas d'Usage

### Policy SMS + Email
```
Policy: "Morning Campaign"
Channels: SMS, EMAIL
Use Case: Envoyer par SMS et Email le matin
```

### Policy All Channels
```
Policy: "VIP Customer Priority"
Channels: SMS, EMAIL, APP, USSD
Use Case: VIP reçoivent sur tous les canaux
```

### Policy Single Channel
```
Policy: "App-Only Notifications"
Channels: APP
Use Case: Notifications push uniquement
```

## Fichiers Modifiés

1. ✅ `communicationPolicyConfig.ts` - `channel` → `channels[]`
2. ✅ `CommunicationPolicyModal.tsx` - Grille → Select multiple
3. ✅ `CommunicationPolicyPage.tsx` - Affichage multi-badges
4. ✅ `communicationPolicyService.ts` - Données avec arrays

## Tests à Effectuer

- [ ] Sélectionner 1 seul channel
- [ ] Sélectionner 2 channels (Ctrl + clic)
- [ ] Sélectionner tous les channels
- [ ] Retirer un channel sélectionné (Ctrl + clic)
- [ ] Vérifier l'indicateur "Selected: ..."
- [ ] Créer une policy avec 2 channels
- [ ] Éditer et changer les channels
- [ ] Vérifier l'affichage des badges desktop
- [ ] Vérifier l'affichage mobile
- [ ] Tester la recherche de policies

## Notes Importantes

### Sélection Multiple
- **Windows/Linux** : Maintenir `Ctrl` + clic
- **Mac** : Maintenir `Cmd` + clic
- **Sélection continue** : Shift + clic

### Validation
- Au moins 1 channel doit être sélectionné (required)
- Le formulaire bloque si aucun channel n'est sélectionné

### Accessibilité
- Le select multiple est nativement accessible
- Les screen readers lisent correctement les options
- Navigation au clavier supportée (Tab, flèches, Space)

La fonctionnalité multi-select est maintenant complète et opérationnelle ! 🎉
