// Translation interface - shared across all languages
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

  // Dashboard
  dashboard: {
    welcome: string;
    overview: string;
    activeCampaigns: string;
    pendingApprovals: string;
    completedCampaigns: string;
    pausedCampaigns: string;
    currentlyRunning: string;
    noCampaignsRunning: string;
    awaitingApproval: string;
    noPendingApproval: string;
    successfullyFinished: string;
    noCompletedCampaigns: string;
    temporarilyStopped: string;
    noPausedCampaigns: string;
    campaignStatus: string;
    campaignStatusDistribution: string;
    noCampaignStatusData: string;
    campaignPerformance: string;
    noCampaignPerformanceData: string;
    topPerformingCampaigns: string;
    recentCampaigns: string;
    recentOffers: string;
    recentSegments: string;
    recentProducts: string;
    quickActions: string;
    createCampaign: string;
    newOffer: string;
    buildSegment: string;
    createProduct: string;
    configuration: string;
    requiresAttention: string;
    campaignExpiringSoon: string;
    offerExpiring: string;
    pendingApproval: string;
    segmentUpdateNeeded: string;
    members: string;
    code: string;
    budget: string;
    engaged: string;
    recentlyAdded: string;
    newlyCreated: string;
    participants: string;
    spend: string;
    campaignsByParticipants: string;
    campaignsBySpend: string;
    conversion: string;
    loadingTopCampaigns: string;
    quickInsights: string;
    instantHighlights: string;
    topPerformingOffers: string;
    requiresAttention: string;
    reviewAndExtend: string;
    review: string;
    approve: string;
    update: string;
    offersByAcceptanceRate: string;
    actionItemsNeedReview: string;
    acceptance: string;
  };

  // Page Titles
  pages: {
    dashboard: string;
    campaigns: string;
    campaignsDescription: string;
    offers: string;
    offersDescription: string;
    products: string;
    productsDescription: string;
    segments: string;
    customers: string;
    users: string;
    settings: string;
    reports: string;
    jobs: string;
    quicklists: string;
    createCampaign: string;
    editCampaign: string;
    campaignDetails: string;
    createOffer: string;
    editOffer: string;
    offerDetails: string;
    createProduct: string;
    editProduct: string;
    productDetails: string;
    createSegment: string;
    editSegment: string;
    segmentDetails: string;
    userDetails: string;
    customerDetails: string;
    programDetails: string;
    categoryDetails: string;
    offerCategoryDetails: string;
    productCategoryDetails: string;
    campaignAnalytics: string;
    programs: string;
    offerCategories: string;
    productCategories: string;
    userManagement: string;
    customerManagement: string;
  };

  // User Management
  userManagement: {
    title: string;
    description: string;
    addUser: string;
    users: string;
    pendingRequests: string;
    analytics: string;
    searchUsers: string;
    totalUsers: string;
    activeUsers: string;
    pendingActivation: string;
    lockedUsers: string;
    userNotFound: string;
    backToUserManagement: string;
    approveRequest: string;
    rejectRequest: string;
    deleteUser: string;
    activateUser: string;
    deactivateUser: string;
    cached: string;
  };

  // Configuration
  configuration: {
    title: string;
    description: string;
    searchPlaceholder: string;
    allConfigurations: string;
    campaign: string;
    offer: string;
    product: string;
    segment: string;
    user: string;
    controlGroup: string;
    showing: string;
    of: string;
    configurations: string;
  };

  // Generic Configuration Component
  genericConfig: {
    delete: string;
    cancel: string;
    loading: string;
    noItemsFound: string;
    noItems: string;
    tryAdjustingSearch: string;
    createFirstItem: string;
  };

  // Profile
  profile: {
    title: string;
    description: string;
    editProfile: string;
    saveChanges: string;
    saving: string;
    cancel: string;
    profileUpdated: string;
    profileUpdatedSuccess: string;
  };

  // Manual Broadcast
  manualBroadcast: {
    title: string;
    targetAudience: string;
    defineCommunication: string;
    testBroadcast: string;
    schedule: string;
    targetAudienceDesc: string;
    defineCommunicationDesc: string;
    testBroadcastDesc: string;
    scheduleDesc: string;
    createdSuccess: string;
    createFailed: string;
  };

  // Servers
  servers: {
    title: string;
    description: string;
    selectServers: string;
    exitSelection: string;
    addServer: string;
    loadingServers: string;
    activateServers: string;
    deactivateServers: string;
    enableHealthChecks: string;
    disableHealthChecks: string;
  };

  // Jobs
  jobs: {
    jobTypes: string;
    scheduledJobs: string;
    scheduledJobsDescription: string;
    createJobType: string;
    editJobType: string;
    updateJobType: string;
    jobTypeDetails: string;
    totalScheduledJobs: string;
    analytics: string;
    noScheduledJobsFound: string;
    allJobTypes: string;
    updateJobTypeDesc: string;
    createJobTypeDesc: string;
  };
}
