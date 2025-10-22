# Guide d'utilisation du modèle générique de configuration

## Vue d'ensemble

Le modèle générique de configuration permet de créer rapidement des pages de gestion (CRUD) avec une interface utilisateur cohérente. Il élimine la duplication de code entre les pages similaires comme Campaign Objectives et Departments.

## Architecture

### Fichiers principaux

1. **`GenericConfigurationPage.tsx`** - Composant principal réutilisable
2. **`configurationPageConfigs.ts`** - Configurations pour chaque type de page
3. **Pages spécifiques** - Implémentations simples utilisant le modèle générique

## Comment créer une nouvelle page de configuration

### Étape 1: Créer la configuration

Dans `src/shared/configs/configurationPageConfigs.ts`, ajoutez votre configuration :

```typescript
// Données exemple (optionnel)
const hardcodedYourItems: ConfigurationItem[] = [
    {
        id: 1,
        name: 'Example Item',
        description: 'Description of the item',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-20T14:45:00Z'
    }
];

// Configuration de votre page
export const yourItemsConfig: ConfigurationPageConfig = {
    // Configuration de la page
    title: 'Your Items',
    subtitle: 'Manage your items',
    entityName: 'item',
    entityNamePlural: 'items',
    
    // Navigation
    backPath: '/dashboard/campaigns',
    
    // Interface utilisateur
    icon: YourIcon, // Importez l'icône depuis lucide-react
    searchPlaceholder: 'Search items...',
    
    // Données
    initialData: hardcodedYourItems,
    
    // Labels
    createButtonText: 'Create Item',
    modalTitle: {
        create: 'Create New Item',
        edit: 'Edit Item'
    },
    nameLabel: 'Item Name',
    nameRequired: true,
    descriptionLabel: 'Description',
    descriptionRequired: false,
    
    // Validation
    nameMaxLength: 100,
    descriptionMaxLength: 500,
    
    // Messages
    deleteConfirmTitle: 'Delete Item',
    deleteConfirmMessage: (name: string) => `Are you sure you want to delete "${name}"?`,
    deleteSuccessMessage: (name: string) => `"${name}" has been deleted successfully.`,
    createSuccessMessage: 'Item created successfully',
    updateSuccessMessage: 'Item updated successfully',
    deleteErrorMessage: 'Failed to delete item',
    saveErrorMessage: 'Please try again later.'
};
```

### Étape 2: Créer la page

Créez un nouveau fichier pour votre page :

```typescript
import React from 'react';
import GenericConfigurationPage from '../../../shared/components/GenericConfigurationPage';
import { yourItemsConfig } from '../../../shared/configs/configurationPageConfigs';

export default function YourItemsPage() {
    return <GenericConfigurationPage config={yourItemsConfig} />;
}
```

### Étape 3: Ajouter la route (optionnel)

Dans `Dashboard.tsx`, ajoutez la route :

```typescript
<Route path="/your-items" element={<YourItemsPage />} />
```

### Étape 4: Ajouter la navigation (optionnel)

Dans `Sidebar.tsx`, ajoutez l'élément de navigation.

## Exemples d'implémentation

### 1. Campaign Objectives
- **Configuration**: `campaignObjectivesConfig`
- **Page**: `CampaignObjectivesPage.tsx`
- **Caractéristiques**: Description optionnelle, 100 chars max pour le nom

### 2. Departments
- **Configuration**: `departmentsConfig`
- **Page**: `DepartmentPage.tsx`
- **Caractéristiques**: Description optionnelle, icône Building2

### 3. Team Roles (exemple)
- **Configuration**: `teamRolesConfig`
- **Page**: `TeamRolesPage.tsx`
- **Caractéristiques**: Description obligatoire, validation différente

## Fonctionnalités incluses

### Interface utilisateur
- ✅ Design responsive (desktop/mobile)
- ✅ Recherche en temps réel
- ✅ Pagination automatique
- ✅ États de chargement
- ✅ Messages de confirmation
- ✅ Validation de formulaire

### Fonctionnalités CRUD
- ✅ Création d'éléments via modal
- ✅ Édition d'éléments existants
- ✅ Suppression avec confirmation
- ✅ Recherche et filtrage
- ✅ Gestion des erreurs

### Personnalisation
- ✅ Icônes personnalisables
- ✅ Messages personnalisables
- ✅ Validation personnalisable
- ✅ Couleurs cohérentes avec le design system

## Configuration avancée

### Utilisation de la fonction helper

Pour des configurations simples, utilisez la fonction helper :

```typescript
export const simpleConfig = createConfigurationPageConfig({
    title: 'Simple Items',
    entityName: 'item',
    icon: Package,
    initialData: myData
});
```

### Validation personnalisée

Modifiez les règles de validation dans votre configuration :

```typescript
nameMaxLength: 50,        // Limite de caractères pour le nom
descriptionMaxLength: 200, // Limite de caractères pour la description
nameRequired: true,       // Nom obligatoire
descriptionRequired: false // Description optionnelle
```

### Messages personnalisés

Personnalisez tous les messages affichés à l'utilisateur :

```typescript
deleteConfirmMessage: (name: string) => `Êtes-vous sûr de vouloir supprimer "${name}" ?`,
createSuccessMessage: 'Élément créé avec succès',
// ... autres messages
```

## Bonnes pratiques

1. **Nommage cohérent** : Utilisez des noms cohérents pour `entityName` et `entityNamePlural`
2. **Icônes appropriées** : Choisissez des icônes qui représentent bien votre entité
3. **Messages clairs** : Rédigez des messages d'erreur et de succès clairs
4. **Validation appropriée** : Définissez des limites de caractères raisonnables
5. **Données d'exemple** : Fournissez des données d'exemple réalistes

## Avantages du modèle générique

- **Réduction du code** : 90% de réduction du code par page
- **Cohérence** : Interface utilisateur uniforme
- **Maintenabilité** : Corrections et améliorations centralisées
- **Rapidité** : Création de nouvelles pages en quelques minutes
- **Flexibilité** : Personnalisation facile via la configuration

## Migration des pages existantes

Pour migrer une page existante vers le modèle générique :

1. Identifiez la structure des données (nom, description, etc.)
2. Créez une configuration dans `configurationPageConfigs.ts`
3. Remplacez le contenu de la page par l'implémentation générique
4. Testez toutes les fonctionnalités
5. Supprimez l'ancien code

Cette approche garantit une interface utilisateur cohérente et réduit considérablement le temps de développement pour les nouvelles pages de configuration.
