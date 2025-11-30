// Translation keys and translations for all supported languages
export type TranslationKey = string;

export interface Translations {
  // Common UI
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    loading: string;
    noData: string;
    confirm: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    clear: string;
    select: string;
    selectAll: string;
    deselectAll: string;
    actions: string;
    status: string;
    active: string;
    inactive: string;
    draft: string;
    name: string;
    description: string;
    date: string;
    time: string;
    type: string;
    category: string;
    price: string;
    currency: string;
    budget: string;
    revenue: string;
    total: string;
    average: string;
    count: string;
    yes: string;
    no: string;
  };

  // Navigation
  navigation: {
    dashboard: string;
    campaigns: string;
    offers: string;
    products: string;
    segments: string;
    customers: string;
    users: string;
    settings: string;
    reports: string;
    jobs: string;
    quicklists: string;
  };

  // Campaigns
  campaigns: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    name: string;
    description: string;
    budgetAllocated: string;
    status: string;
    startDate: string;
    endDate: string;
    audience: string;
    offers: string;
    segments: string;
    performance: string;
    revenue: string;
    conversions: string;
    sent: string;
    delivered: string;
  };

  // Settings
  settings: {
    title: string;
    location: string;
    country: string;
    countryCode: string;
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    numberFormatting: string;
    saveChanges: string;
    settingsSaved: string;
  };

  // Messages
  messages: {
    saved: string;
    deleted: string;
    created: string;
    updated: string;
    error: string;
    success: string;
    confirmDelete: string;
    areYouSure: string;
  };

  // Page Titles
  pages: {
    dashboard: string;
    campaigns: string;
    offers: string;
    products: string;
    segments: string;
    customers: string;
    users: string;
    settings: string;
    reports: string;
    jobs: string;
    quicklists: string;
    createCampaign: string;
    editCampaign: string;
    createOffer: string;
    editOffer: string;
    createProduct: string;
    editProduct: string;
    createSegment: string;
    editSegment: string;
  };
}

export const translations: Record<"en" | "fr" | "es" | "sw", Translations> = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      update: "Update",
      search: "Search",
      filter: "Filter",
      loading: "Loading...",
      noData: "No data available",
      confirm: "Confirm",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      reset: "Reset",
      clear: "Clear",
      select: "Select",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      actions: "Actions",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      draft: "Draft",
      name: "Name",
      description: "Description",
      date: "Date",
      time: "Time",
      type: "Type",
      category: "Category",
      price: "Price",
      currency: "Currency",
      budget: "Budget",
      revenue: "Revenue",
      total: "Total",
      average: "Average",
      count: "Count",
      yes: "Yes",
      no: "No",
    },
    navigation: {
      dashboard: "Dashboard",
      campaigns: "Campaigns",
      offers: "Offers",
      products: "Products",
      segments: "Segments",
      customers: "Customers",
      users: "Users",
      settings: "Settings",
      reports: "Reports",
      jobs: "Jobs",
      quicklists: "Quicklists",
    },
    campaigns: {
      title: "Campaigns",
      create: "Create Campaign",
      edit: "Edit Campaign",
      delete: "Delete Campaign",
      name: "Campaign Name",
      description: "Description",
      budgetAllocated: "Budget Allocated",
      status: "Status",
      startDate: "Start Date",
      endDate: "End Date",
      audience: "Audience",
      offers: "Offers",
      segments: "Segments",
      performance: "Performance",
      revenue: "Revenue",
      conversions: "Conversions",
      sent: "Sent",
      delivered: "Delivered",
    },
    settings: {
      title: "Settings",
      location: "Location",
      country: "Country",
      countryCode: "Country Code",
      language: "Language",
      timezone: "Timezone",
      dateFormat: "Date Format",
      currency: "Currency",
      numberFormatting: "Number Formatting",
      saveChanges: "Save Changes",
      settingsSaved: "Settings saved successfully",
    },
    messages: {
      saved: "Saved successfully",
      deleted: "Deleted successfully",
      created: "Created successfully",
      updated: "Updated successfully",
      error: "An error occurred",
      success: "Success",
      confirmDelete: "Are you sure you want to delete this item?",
      areYouSure: "Are you sure?",
    },
    pages: {
      dashboard: "Dashboard",
      campaigns: "Campaigns",
      offers: "Offers",
      products: "Products",
      segments: "Segments",
      customers: "Customers",
      users: "Users",
      settings: "Settings",
      reports: "Reports",
      jobs: "Jobs",
      quicklists: "Quicklists",
      createCampaign: "Create Campaign",
      editCampaign: "Edit Campaign",
      createOffer: "Create Offer",
      editOffer: "Edit Offer",
      createProduct: "Create Product",
      editProduct: "Edit Product",
      createSegment: "Create Segment",
      editSegment: "Edit Segment",
    },
  },

  fr: {
    common: {
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      create: "Créer",
      update: "Mettre à jour",
      search: "Rechercher",
      filter: "Filtrer",
      loading: "Chargement...",
      noData: "Aucune donnée disponible",
      confirm: "Confirmer",
      close: "Fermer",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent",
      submit: "Soumettre",
      reset: "Réinitialiser",
      clear: "Effacer",
      select: "Sélectionner",
      selectAll: "Tout sélectionner",
      deselectAll: "Tout désélectionner",
      actions: "Actions",
      status: "Statut",
      active: "Actif",
      inactive: "Inactif",
      draft: "Brouillon",
      name: "Nom",
      description: "Description",
      date: "Date",
      time: "Heure",
      type: "Type",
      category: "Catégorie",
      price: "Prix",
      currency: "Devise",
      budget: "Budget",
      revenue: "Revenus",
      total: "Total",
      average: "Moyenne",
      count: "Nombre",
      yes: "Oui",
      no: "Non",
    },
    navigation: {
      dashboard: "Tableau de bord",
      campaigns: "Campagnes",
      offers: "Offres",
      products: "Produits",
      segments: "Segments",
      customers: "Clients",
      users: "Utilisateurs",
      settings: "Paramètres",
      reports: "Rapports",
      jobs: "Tâches",
      quicklists: "Listes rapides",
    },
    campaigns: {
      title: "Campagnes",
      create: "Créer une campagne",
      edit: "Modifier la campagne",
      delete: "Supprimer la campagne",
      name: "Nom de la campagne",
      description: "Description",
      budgetAllocated: "Budget alloué",
      status: "Statut",
      startDate: "Date de début",
      endDate: "Date de fin",
      audience: "Audience",
      offers: "Offres",
      segments: "Segments",
      performance: "Performance",
      revenue: "Revenus",
      conversions: "Conversions",
      sent: "Envoyé",
      delivered: "Livré",
    },
    settings: {
      title: "Paramètres",
      location: "Emplacement",
      country: "Pays",
      countryCode: "Code pays",
      language: "Langue",
      timezone: "Fuseau horaire",
      dateFormat: "Format de date",
      currency: "Devise",
      numberFormatting: "Formatage des nombres",
      saveChanges: "Enregistrer les modifications",
      settingsSaved: "Paramètres enregistrés avec succès",
    },
    messages: {
      saved: "Enregistré avec succès",
      deleted: "Supprimé avec succès",
      created: "Créé avec succès",
      updated: "Mis à jour avec succès",
      error: "Une erreur s'est produite",
      success: "Succès",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer cet élément?",
      areYouSure: "Êtes-vous sûr?",
    },
    pages: {
      dashboard: "Tableau de bord",
      campaigns: "Campagnes",
      offers: "Offres",
      products: "Produits",
      segments: "Segments",
      customers: "Clients",
      users: "Utilisateurs",
      settings: "Paramètres",
      reports: "Rapports",
      jobs: "Tâches",
      quicklists: "Listes rapides",
      createCampaign: "Créer une campagne",
      editCampaign: "Modifier la campagne",
      createOffer: "Créer une offres",
      editOffer: "Modifier l'offre",
      createProduct: "Créer un produit",
      editProduct: "Modifier le produit",
      createSegment: "Créer un segment",
      editSegment: "Modifier le segment",
    },
  },

  es: {
    common: {
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      create: "Crear",
      update: "Actualizar",
      search: "Buscar",
      filter: "Filtrar",
      loading: "Cargando...",
      noData: "No hay datos disponibles",
      confirm: "Confirmar",
      close: "Cerrar",
      back: "Atrás",
      next: "Siguiente",
      previous: "Anterior",
      submit: "Enviar",
      reset: "Restablecer",
      clear: "Limpiar",
      select: "Seleccionar",
      selectAll: "Seleccionar todo",
      deselectAll: "Deseleccionar todo",
      actions: "Acciones",
      status: "Estado",
      active: "Activo",
      inactive: "Inactivo",
      draft: "Borrador",
      name: "Nombre",
      description: "Descripción",
      date: "Fecha",
      time: "Hora",
      type: "Tipo",
      category: "Categoría",
      price: "Precio",
      currency: "Moneda",
      budget: "Presupuesto",
      revenue: "Ingresos",
      total: "Total",
      average: "Promedio",
      count: "Cantidad",
      yes: "Sí",
      no: "No",
    },
    navigation: {
      dashboard: "Panel de control",
      campaigns: "Campañas",
      offers: "Ofertas",
      products: "Productos",
      segments: "Segmentos",
      customers: "Clientes",
      users: "Usuarios",
      settings: "Configuración",
      reports: "Informes",
      jobs: "Trabajos",
      quicklists: "Listas rápidas",
    },
    campaigns: {
      title: "Campañas",
      create: "Crear campaña",
      edit: "Editar campaña",
      delete: "Eliminar campaña",
      name: "Nombre de la campaña",
      description: "Descripción",
      budgetAllocated: "Presupuesto asignado",
      status: "Estado",
      startDate: "Fecha de inicio",
      endDate: "Fecha de fin",
      audience: "Audiencia",
      offers: "Ofertas",
      segments: "Segmentos",
      performance: "Rendimiento",
      revenue: "Ingresos",
      conversions: "Conversiones",
      sent: "Enviado",
      delivered: "Entregado",
    },
    settings: {
      title: "Configuración",
      location: "Ubicación",
      country: "País",
      countryCode: "Código de país",
      language: "Idioma",
      timezone: "Zona horaria",
      dateFormat: "Formato de fecha",
      currency: "Moneda",
      numberFormatting: "Formato de números",
      saveChanges: "Guardar cambios",
      settingsSaved: "Configuración guardada exitosamente",
    },
    messages: {
      saved: "Guardado exitosamente",
      deleted: "Eliminado exitosamente",
      created: "Creado exitosamente",
      updated: "Actualizado exitosamente",
      error: "Ocurrió un error",
      success: "Éxito",
      confirmDelete: "¿Está seguro de que desea eliminar este elemento?",
      areYouSure: "¿Está seguro?",
    },
    pages: {
      dashboard: "Panel de control",
      campaigns: "Campañas",
      offers: "Ofertas",
      products: "Productos",
      segments: "Segmentos",
      customers: "Clientes",
      users: "Usuarios",
      settings: "Configuración",
      reports: "Informes",
      jobs: "Trabajos",
      quicklists: "Listas rápidas",
      createCampaign: "Crear campaña",
      editCampaign: "Editar campaña",
      createOffer: "Crear oferta",
      editOffer: "Editar oferta",
      createProduct: "Crear producto",
      editProduct: "Editar producto",
      createSegment: "Crear segmento",
      editSegment: "Editar segmento",
    },
  },

  sw: {
    common: {
      save: "Hifadhi",
      cancel: "Ghairi",
      delete: "Futa",
      edit: "Hariri",
      create: "Unda",
      update: "Sasisha",
      search: "Tafuta",
      filter: "Chuja",
      loading: "Inapakia...",
      noData: "Hakuna data inayopatikana",
      confirm: "Thibitisha",
      close: "Funga",
      back: "Rudi",
      next: "Ifuatayo",
      previous: "Iliyotangulia",
      submit: "Wasilisha",
      reset: "Weka upya",
      clear: "Futa",
      select: "Chagua",
      selectAll: "Chagua zote",
      deselectAll: "Acha kuchagua zote",
      actions: "Vitendo",
      status: "Hali",
      active: "Hai",
      inactive: "Haifanyi kazi",
      draft: "Rasimu",
      name: "Jina",
      description: "Maelezo",
      date: "Tarehe",
      time: "Muda",
      type: "Aina",
      category: "Jamii",
      price: "Bei",
      currency: "Sarafu",
      budget: "Bajeti",
      revenue: "Mapato",
      total: "Jumla",
      average: "Wastani",
      count: "Hesabu",
      yes: "Ndiyo",
      no: "Hapana",
    },
    navigation: {
      dashboard: "Dashibodi",
      campaigns: "Kampeni",
      offers: "Matoleo",
      products: "Bidhaa",
      segments: "Sehemu",
      customers: "Wateja",
      users: "Watumiaji",
      settings: "Mipangilio",
      reports: "Ripoti",
      jobs: "Kazi",
      quicklists: "Orodha za haraka",
    },
    campaigns: {
      title: "Kampeni",
      create: "Unda kampeni",
      edit: "Hariri kampeni",
      delete: "Futa kampeni",
      name: "Jina la kampeni",
      description: "Maelezo",
      budgetAllocated: "Bajeti iliyotengwa",
      status: "Hali",
      startDate: "Tarehe ya kuanza",
      endDate: "Tarehe ya mwisho",
      audience: "Hadhira",
      offers: "Matoleo",
      segments: "Sehemu",
      performance: "Utendaji",
      revenue: "Mapato",
      conversions: "Uongofu",
      sent: "Imetumwa",
      delivered: "Imetumwa",
    },
    settings: {
      title: "Mipangilio",
      location: "Eneo",
      country: "Nchi",
      countryCode: "Msimbo wa nchi",
      language: "Lugha",
      timezone: "Ukanda wa muda",
      dateFormat: "Muundo wa tarehe",
      currency: "Sarafu",
      numberFormatting: "Uundaji wa nambari",
      saveChanges: "Hifadhi mabadiliko",
      settingsSaved: "Mipangilio imehifadhiwa kwa mafanikio",
    },
    messages: {
      saved: "Imehifadhiwa kwa mafanikio",
      deleted: "Imefutwa kwa mafanikio",
      created: "Imeundwa kwa mafanikio",
      updated: "Imesasishwa kwa mafanikio",
      error: "Hitilafu imetokea",
      success: "Mafanikio",
      confirmDelete: "Je, una uhakika unataka kufuta kipengele hiki?",
      areYouSure: "Je, una uhakika?",
    },
    pages: {
      dashboard: "Dashibodi",
      campaigns: "Kampeni",
      offers: "Matoleo",
      products: "Bidhaa",
      segments: "Sehemu",
      customers: "Wateja",
      users: "Watumiaji",
      settings: "Mipangilio",
      reports: "Ripoti",
      jobs: "Kazi",
      quicklists: "Orodha za haraka",
      createCampaign: "Unda kampeni",
      editCampaign: "Hariri kampeni",
      createOffer: "Unda matoleo",
      editOffer: "Hariri matoleo",
      createProduct: "Unda bidhaa",
      editProduct: "Hariri bidhaa",
      createSegment: "Unda sehemu",
      editSegment: "Hariri sehemu",
    },
  },
};
