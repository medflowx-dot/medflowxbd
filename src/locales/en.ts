export const en = {
  // Language
  language: 'English',
  languageCode: 'en',

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    medicines: 'Medicines',
    batches: 'Batches',
    manufacturers: 'Manufacturers',
    suppliers: 'Suppliers',
    sales: 'Sales',
    customerDues: 'Customer Dues',
    dailyCash: 'Daily Cash',
    expiryMonitor: 'Expiry Monitor',
    alerts: 'Alerts',
    reports: 'Reports',
    settings: 'Settings',
    adminDashboard: 'Admin Dashboard',
  },

  // Menu Groups
  menuGroups: {
    inventory: 'Inventory',
    salesFinance: 'Sales & Finance',
    monitoring: 'Monitoring',
    analytics: 'Analytics',
    admin: 'Admin',
  },

  // Header
  header: {
    notifications: 'Notifications',
    noAlerts: 'No alerts at this time',
    viewAllAlerts: 'View All Alerts',
    alerts: 'alerts',
    profileSettings: 'Profile & Settings',
    signOut: 'Sign out',
    signedOutSuccess: 'Signed out successfully',
  },

  // Notifications
  notifications: {
    expiredMedicines: 'Expired Medicines',
    batchExpired: 'batch expired',
    batchesExpired: 'batches expired',
    expiringSoon: 'Expiring Soon',
    batchExpiring: 'batch expiring in 30 days',
    batchesExpiring: 'batches expiring in 30 days',
    customerDues: 'Customer Dues',
    customerOwe: 'customer owe',
    customersOwe: 'customers owe',
    supplierDues: 'Supplier Dues',
    supplierOwed: 'supplier owed',
    suppliersOwed: 'suppliers owed',
    urgent: 'Urgent',
    warning: 'Warning',
    collect: 'Collect',
    pay: 'Pay',
  },

  // Roles
  roles: {
    owner: 'Owner',
    admin: 'Admin',
    staff: 'Staff',
    ownerAdmin: 'Owner Admin',
    pharmacyAdmin: 'Pharmacy Admin',
    staffMember: 'Staff Member',
    user: 'User',
  },

  // Subscription
  subscription: {
    freeTrial: 'Free Trial',
    monthlyPlan: 'Monthly Plan',
    yearlyPlan: 'Yearly Plan',
    lifetime: 'Lifetime',
    active: 'Active',
    fullAccess: 'Full Access',
    daysRemaining: 'days remaining',
  },

  // Footer
  footer: {
    copyright: '©',
  },

  // Dashboard Home
  dashboard: {
    title: 'Dashboard',
    welcome: "Welcome back! Here's your pharmacy overview.",
    todaysSales: "Today's Sales",
    todaysCosts: "Today's Costs",
    customerDues: 'Customer Dues',
    supplierDues: 'Supplier Dues',
    expiryAlerts: 'Expiry Alerts',
    viewAll: 'View All',
    expired: 'Expired',
    days30: '30 Days',
    days60: '60 Days',
    days90: '90 Days',
    quickAccess: 'Quick Access',
    medicines: 'Medicines',
    medicinesDesc: 'Manage inventory & batches',
    sales: 'Sales',
    salesDesc: 'Daily sales tracking',
    customerDuesTitle: 'Customer Dues',
    customerDuesDesc: 'Track customer balances',
    suppliers: 'Suppliers',
    suppliersDesc: 'Manage suppliers & payments',
    reports: 'Reports',
    reportsDesc: 'Analytics & exports',
    trialTitle: "🎉 You're on the Free Trial",
    trialDesc: 'days remaining. Upgrade anytime to continue.',
    upgradeNow: 'Upgrade Now',
  },

  // Common Actions
  actions: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    print: 'Print',
    refresh: 'Refresh',
    viewAll: 'View All',
    close: 'Close',
  },

  // Common Labels
  labels: {
    name: 'Name',
    price: 'Price',
    quantity: 'Quantity',
    date: 'Date',
    status: 'Status',
    total: 'Total',
    amount: 'Amount',
    notes: 'Notes',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
  },

  // Messages
  messages: {
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    noData: 'No data available',
    confirmDelete: 'Are you sure you want to delete?',
  },
};

export type TranslationKeys = typeof en;
