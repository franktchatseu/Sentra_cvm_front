# QuickLists Feature

Module complet pour gérer les QuickLists - des listes de clients uploadées pour une communication rapide.

## 📁 Structure des Fichiers

```
quicklists/
├── types/
│   └── quicklist.ts                 # Types TypeScript pour QuickLists
├── services/
│   └── quicklistService.ts          # Service API pour toutes les opérations
├── pages/
│   └── QuickListsPage.tsx           # Page principale avec liste et filtres
├── components/
│   ├── CreateQuickListModal.tsx     # Modal pour uploader un nouveau QuickList
│   └── QuickListDetailsModal.tsx    # Modal pour voir les détails et données
└── README.md                        # Cette documentation
```

## 🎨 Design System

Le module respecte le design system centralisé de l'application:
- **Couleurs**: Utilise `color` de `utils.ts`
- **Typography**: Utilise `tw` classes (mainHeading, subHeading, etc.)
- **Components**: Cards, badges, buttons avec styles cohérents

## 🔌 Endpoints API Connectés

### QuickList Management
- `GET /quicklists` - Liste tous les QuickLists avec pagination
- `GET /quicklists/:id` - Détails d'un QuickList
- `GET /quicklists/:id/data` - Données du QuickList avec pagination
- `GET /quicklists/:id/logs` - Logs d'import
- `POST /quicklists` - Créer un QuickList (upload fichier Excel)
- `PATCH /quicklists/:id` - Mettre à jour nom/description
- `DELETE /quicklists/:id` - Supprimer un QuickList

### Search & Export
- `GET /quicklists/search?q=...` - Rechercher des QuickLists
- `GET /quicklists/:id/export?format=csv|json` - Exporter les données

### Configuration
- `GET /quicklists/upload-types` - Liste des types d'upload configurés
- `GET /quicklists/stats` - Statistiques globales

## ✨ Fonctionnalités Implémentées

### 1. Page Principale (QuickListsPage)
- ✅ Liste de tous les QuickLists
- ✅ Recherche par nom
- ✅ Filtre par type d'upload
- ✅ Affichage des informations clés (rows, file size, date)
- ✅ Actions: View, Export (CSV/JSON), Delete

### 2. Modal de Création (CreateQuickListModal)
- ✅ Sélection du type d'upload
- ✅ Upload de fichier Excel (.xlsx, .xls)
- ✅ Validation de taille de fichier
- ✅ Auto-fill du nom depuis le filename
- ✅ Affichage des colonnes attendues
- ✅ Description optionnelle

### 3. Modal de Détails (QuickListDetailsModal)
- ✅ Informations générales avec cards colorées
- ✅ Onglet "Data Preview" - Affiche les 50 premières lignes
- ✅ Onglet "Import Logs" - Affiche les logs d'import
- ✅ Export CSV/JSON direct depuis le modal

## 🎯 Utilisation

### Créer un QuickList

```typescript
// Dans CreateQuickListModal
const handleSubmit = async (file: File, uploadType: string, name: string, description?: string) => {
  const request = {
    file,
    upload_type: uploadType,
    name,
    description,
    created_by: 'user@example.com',
  };
  await quicklistService.createQuickList(request);
};
```

### Récupérer des QuickLists

```typescript
// Tous les QuickLists
const response = await quicklistService.getAllQuickLists({ 
  limit: 100,
  offset: 0 
});

// Filtré par type
const response = await quicklistService.getAllQuickLists({ 
  upload_type: 'customer_subscription',
  limit: 100 
});

// Recherche
const response = await quicklistService.searchQuickLists({
  q: 'customer',
  upload_type: 'subscription_data'
});
```

### Export de Données

```typescript
// Export CSV
const blob = await quicklistService.exportQuickList(quicklistId, 'csv');
const url = window.URL.createObjectURL(blob);
// Télécharger le fichier

// Export JSON
const blob = await quicklistService.exportQuickList(quicklistId, 'json');
```

## 📊 Types de Données

```typescript
interface QuickList {
  id: number;
  name: string;
  description?: string | null;
  upload_type: string;
  file_name: string;
  file_hash: string;
  file_size: number;
  row_count: number;
  column_count: number;
  columns: string[];
  created_at: string;
  created_by: string;
}

interface UploadType {
  upload_type: string;
  description?: string | null;
  expected_columns: string[];
  allow_extra_columns: boolean;
  require_all_columns: boolean;
  max_file_size_mb: number;
  cache_ttl_seconds: number;
  is_active: boolean;
}
```

## 🔐 Sécurité

- Les fichiers sont validés côté client (type, taille)
- Headers d'authentification ajoutés automatiquement via `getAuthHeaders()`
- Confirmation modal avant suppression

## 📝 TODO / Améliorations Futures

- [ ] Intégrer l'authentification réelle (remplacer `user@example.com`)
- [ ] Ajouter pagination pour les grandes listes
- [ ] Ajouter la fonctionnalité d'édition du nom/description
- [ ] Afficher les statistiques (via `/stats` endpoint)
- [ ] Ajouter le drag & drop pour l'upload de fichiers
- [ ] Ajouter la possibilité de télécharger le template Excel
- [ ] Intégrer avec le module Communications pour envoyer des messages

## 🔗 Intégration Communications

Le backend fournit également un endpoint pour envoyer des communications:

```typescript
POST /communications/send
{
  "source_type": "quicklist",
  "source_id": 1,
  "channels": ["EMAIL"],
  "message_template": {
    "title": "Welcome {{first_name}}!",
    "body": "Hello {{first_name}} {{last_name}}..."
  }
}
```

Cette intégration pourra être ajoutée dans le QuickListDetailsModal pour permettre l'envoi direct de messages.

## 🎨 Couleurs du Theme

Le module utilise les couleurs définies dans `utils.ts`:
- **Primary Action**: Boutons principaux (Create, Upload)
- **Success/Danger/Warning**: Badges de status
- **Text Primary/Secondary/Muted**: Hiérarchie de texte
- **Border Default/Accent**: Bordures et dividers
