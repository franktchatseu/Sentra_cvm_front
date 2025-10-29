# Communication Policy - Channel Update

## Vue d'ensemble

Ajout du champ **Communication Channel** (SMS, EMAIL, USSD, APP) dans les Communication Policies avec mise à jour complète de l'interface utilisateur.

## Changements Majeurs

### 1. **Nouveau Type Channel**
```typescript
export type CommunicationChannel = 'SMS' | 'EMAIL' | 'USSD' | 'APP';
```

### 2. **Constantes des Canaux**
```typescript
export const COMMUNICATION_CHANNELS = [
    { value: 'SMS', label: 'SMS', icon: '📱', description: 'Short Message Service' },
    { value: 'EMAIL', label: 'Email', icon: '📧', description: 'Email Communication' },
    { value: 'USSD', label: 'USSD', icon: '📞', description: 'Unstructured Supplementary Service Data' },
    { value: 'APP', label: 'App Notification', icon: '📲', description: 'In-App Push Notification' }
];
```

## Interfaces Mises à Jour

### CommunicationPolicyConfiguration
```typescript
export interface CommunicationPolicyConfiguration {
    id: number;
    name: string;
    description?: string;
    channel: CommunicationChannel;  // ✅ NOUVEAU
    type: CommunicationPolicyType;
    config: TimeWindowConfig | MaximumCommunicationConfig | DNDConfig | VIPListConfig;
    isActive: boolean;
    created_at: string;
    updated_at: string;
}
```

### CreateCommunicationPolicyRequest
```typescript
export interface CreateCommunicationPolicyRequest {
    name: string;
    description?: string;
    channel: CommunicationChannel;  // ✅ NOUVEAU
    type: CommunicationPolicyType;
    config: TimeWindowConfig | MaximumCommunicationConfig | DNDConfig | VIPListConfig;
    isActive?: boolean;
}
```

## Modal de Création

### Nouveau Sélecteur de Channel

Le modal inclut maintenant un sélecteur visuel de canal de communication :

```
┌─────────────────────────────────────────────────┐
│ Communication Channel *                         │
├─────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ 📱   │  │ 📧   │  │ 📞   │  │ 📲   │       │
│  │ SMS  │  │Email │  │USSD  │  │ App  │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                 │
│ Select the communication channel this policy    │
│ applies to                                      │
└─────────────────────────────────────────────────┘
```

### Caractéristiques du Sélecteur

- **Grille responsive** : 2 colonnes sur mobile, 4 colonnes sur desktop
- **Boutons visuels** : Grands boutons avec icônes et labels
- **Indicateur de sélection** :
  - Bordure accent (#4FDFF3) de 2px
  - Ombre portée (shadow-md)
  - Fond teinté accent (10% opacité)
- **État par défaut** : EMAIL
- **Transitions fluides** : 200ms duration

### Code du Sélecteur
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {COMMUNICATION_CHANNELS.map((ch) => (
        <button
            type="button"
            onClick={() => setChannel(ch.value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                channel === ch.value
                    ? 'border-2 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{
                borderColor: channel === ch.value ? color.primary.accent : undefined,
                backgroundColor: channel === ch.value ? `${color.primary.accent}10` : 'white'
            }}
        >
            <div className="flex flex-col items-center space-y-2">
                <span className="text-2xl">{ch.icon}</span>
                <span className={`${tw.caption} font-medium`}>
                    {ch.label}
                </span>
            </div>
        </button>
    ))}
</div>
```

## Page de Liste - Changements

### ❌ **Supprimé** : Colonne "Policy Types"
La colonne affichant les 4 icônes de types a été retirée car les 4 types sont toujours configurés ensemble.

### ✅ **Ajouté** : Colonne "Channel"
Nouvelle colonne affichant le canal de communication.

### Structure du Tableau

**Avant:**
```
| POLICY              | POLICY TYPES | CONFIGURATION SUMMARY | STATUS | ACTIONS |
|---------------------|--------------|----------------------|--------|---------|
| Business Hours      | 🕐📊🔕⭐    | 🕐 09:00-18:00 •...  | Active | ✏️ 🗑️   |
```

**Après:**
```
| POLICY              | CHANNEL | CONFIGURATION SUMMARY       | STATUS | ACTIONS |
|---------------------|---------|----------------------------|--------|---------|
| Business Hours      | 📧 Email| 🕐 09:00-18:00 • + 3 more | Active | ✏️ 🗑️   |
```

### Fonction d'Affichage du Channel

```typescript
const getChannelDisplay = (channelValue: string) => {
    const channel = COMMUNICATION_CHANNELS.find(ch => ch.value === channelValue);
    if (!channel) return null;
    
    return (
        <div className="flex items-center space-x-2">
            <span className="text-lg">{channel.icon}</span>
            <span className={`${tw.caption} font-medium ${tw.textPrimary}`}>
                {channel.label}
            </span>
        </div>
    );
};
```

## Service - Données d'Exemple

Les données mockées incluent maintenant le channel :

```typescript
this.policies = [
    {
        id: 1,
        name: 'Business Hours Time Window',
        channel: 'EMAIL',  // ✅ NOUVEAU
        type: 'timeWindow',
        config: { ... },
        ...
    },
    {
        id: 2,
        name: 'Daily Communication Limit',
        channel: 'SMS',  // ✅ NOUVEAU
        type: 'maximumCommunication',
        config: { ... },
        ...
    },
    {
        id: 3,
        name: 'Marketing DND Policy',
        channel: 'APP',  // ✅ NOUVEAU
        type: 'dnd',
        config: { ... },
        ...
    },
    {
        id: 4,
        name: 'VIP Customer Priority',
        channel: 'USSD',  // ✅ NOUVEAU
        type: 'vipList',
        config: { ... },
        ...
    }
];
```

## Exemples d'Utilisation

### Création d'une Policy EMAIL
```typescript
const policy = {
    name: "Morning Email Campaign",
    description: "Send emails during morning hours",
    channel: "EMAIL",  // 📧
    type: "timeWindow",
    config: { startTime: "08:00", endTime: "12:00" },
    isActive: true
};
```

### Création d'une Policy SMS
```typescript
const policy = {
    name: "SMS Frequency Limit",
    description: "Limit SMS to 5 per day",
    channel: "SMS",  // 📱
    type: "maximumCommunication",
    config: { type: "daily", maxCount: 5 },
    isActive: true
};
```

### Création d'une Policy APP
```typescript
const policy = {
    name: "App Notification Rules",
    description: "DND rules for app notifications",
    channel: "APP",  // 📲
    type: "dnd",
    config: { categories: [...] },
    isActive: true
};
```

### Création d'une Policy USSD
```typescript
const policy = {
    name: "USSD VIP Priority",
    description: "Priority USSD for VIP customers",
    channel: "USSD",  // 📞
    type: "vipList",
    config: { action: "include", priority: 1 },
    isActive: true
};
```

## Vue Desktop vs Mobile

### Desktop (Table)
```
┌────────────────────────────────────────────────────────────────────┐
│ POLICY              │ CHANNEL      │ CONFIGURATION     │ STATUS    │
├────────────────────────────────────────────────────────────────────┤
│ Business Hours      │ 📧 Email     │ 🕐 09:00-18:00 •  │ ✅ Active │
│ SMS Limit           │ 📱 SMS       │ 📊 Max 3/daily •  │ ✅ Active │
│ App DND             │ 📲 App       │ 🔕 2 categories • │ ✅ Active │
│ USSD VIP            │ 📞 USSD      │ ⭐ include (P:1) •│ ✅ Active │
└────────────────────────────────────────────────────────────────────┘
```

### Mobile (Cards)
```
┌──────────────────────────────────────────┐
│ 📧 Email  Business Hours Policy      [✓] │
│ Allow communications during work hours    │
│ All Policy Types: 🕐 09:00-18:00 • ...   │
│                              [✏️] [🗑️]    │
└──────────────────────────────────────────┘
```

## Flux Utilisateur Complet

1. **Cliquer sur "Create Policy"**
2. **Renseigner le nom** : "Weekend SMS Campaign"
3. **Renseigner la description** : "SMS campaigns for weekends"
4. **Sélectionner le channel** : Cliquer sur 📱 SMS
5. **Configurer les 4 types de policy** :
   - Time Window: 10:00-20:00 (Sam-Dim)
   - Max Communication: 5 per day
   - DND: 0 categories
   - VIP List: Include, Priority 1
6. **Cocher "Active Policy"**
7. **Cliquer sur "Create Policy"**
8. **La policy apparaît dans la liste** avec l'icône 📱 SMS

## Validation

### Champs Requis
- ✅ Policy Name
- ✅ Communication Channel (par défaut: EMAIL)

### Champs Optionnels
- Description
- Configurations spécifiques à chaque type

## Avantages

1. **Clarté** : Le channel est immédiatement visible
2. **Organisation** : Une policy par canal de communication
3. **Flexibilité** : Règles différentes pour chaque canal
4. **UX** : Sélecteur visuel intuitif avec icônes
5. **Cohérence** : Design system respecté partout

## Compatibilité Backend

### Structure API Recommandée

**POST /api/communication-policies**
```json
{
    "name": "Business Hours Email",
    "description": "Email policy for business hours",
    "channel": "EMAIL",
    "configs": {
        "timeWindow": { "startTime": "09:00", "endTime": "18:00" },
        "maximumCommunication": { "type": "daily", "maxCount": 3 },
        "dnd": { "categories": [] },
        "vipList": { "action": "include", "priority": 1 }
    },
    "isActive": true
}
```

**GET /api/communication-policies**
```json
[
    {
        "id": 1,
        "name": "Business Hours Email",
        "channel": "EMAIL",
        "configs": { ... },
        "isActive": true,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-20T14:45:00Z"
    }
]
```

## Fichiers Modifiés

1. ✅ `communicationPolicyConfig.ts` - Ajout du type Channel et constantes
2. ✅ `CommunicationPolicyModal.tsx` - Ajout du sélecteur de channel
3. ✅ `CommunicationPolicyPage.tsx` - Suppression colonne Types, ajout colonne Channel
4. ✅ `communicationPolicyService.ts` - Ajout channel aux données mockées

## Tests à Effectuer

- [ ] Créer une policy avec channel SMS
- [ ] Créer une policy avec channel EMAIL
- [ ] Créer une policy avec channel USSD
- [ ] Créer une policy avec channel APP
- [ ] Éditer une policy et changer le channel
- [ ] Vérifier l'affichage dans le tableau
- [ ] Vérifier l'affichage mobile
- [ ] Vérifier le filtre de recherche
- [ ] Vérifier la suppression de policy

La fonctionnalité Channel est maintenant complètement intégrée ! 🎉
