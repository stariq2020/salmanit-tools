/* ============================================================
   Cloud Productivity Advisor — pricing & configuration
   ------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT when providers change
   prices, or to tweak how the recommendation is weighted.

   • Prices are GBP, per user, per month, billed annually, ex VAT.
   • After updating prices, change PRICING_LAST_REVIEWED below.
   • Ratings (0 to 1) are editorial judgements: 1 = fully supported /
     excellent, 0.5 = partial or via workaround, 0 = not available.
   ============================================================ */
(function (root) {
  'use strict';

  var CONFIG = {
    PRICING_LAST_REVIEWED: '2026-10-07',
    CURRENCY: '£',

    // Where the "Book a Free Consultation" buttons point.
    BOOKING_URL: 'mailto:support@salmanitservices.com?subject=Cloud%20setup%20review',
    CONTACT_URL: 'index.html#contact',

    // ---- Recommendation weighting (relative importance of each factor) ----
    BASE_WEIGHTS: {
      cost: 20, apps: 15, desktop: 10, storage: 10, collab: 15,
      email: 10, security: 8, admin: 6, growth: 4
    },
    // Multipliers applied when the user ticks a priority in Step 8.
    PRIORITY_BOOSTS: {
      'Lowest cost':          { cost: 2.5 },
      'Microsoft Office':     { apps: 2, desktop: 2 },
      'Easy file sharing':    { collab: 2.5 },
      'Email':                { email: 2.5 },
      'Security':             { security: 3 },
      'Remote working':       { collab: 1.5, security: 1.3 },
      'Desktop applications': { desktop: 3 },
      'Collaboration':        { collab: 2.5, apps: 1.2 },
      'Large storage':        { storage: 3 },
      'Simple administration':{ admin: 3 },
      'Future growth':        { growth: 3, security: 1.2 }
    },

    // Hard limits: if a requirement is not met, the Fit Score cannot exceed this.
    CAPS: {
      desktopMissing: 58,       // needs desktop Office, plan has none
      storageShort: 55,         // plan storage below requirement
      emailMoveRefused: 58,     // user won't move email but plan would force it
      securityLow: 72           // security is a priority and plan is weak
    },
    SECURITY_PRIORITY_MIN: 0.6,

    // ---- "Stay where you are" rules ----
    STAY: {
      acceptableFit: 60,        // current platform at/above this is considered workable
      // Alternative must beat the current setup by this many Fit points…
      requiredFitGain: { Low: 10, Moderate: 15, High: 22 },
      // …or save at least this much (whichever is larger: £ amount or % of current cost)
      requiredSaving:  { Low: [100, 0.10], Moderate: [250, 0.15], High: [500, 0.25] },
      fitTolerance: -3          // a saving-led switch must not be worse than this on fit
    },

    // ---- Migration complexity points ----
    MIGRATION: {
      lowMax: 2, moderateMax: 6
    },

    FIT_LABELS: [ [85, 'Excellent'], [70, 'Good'], [55, 'Moderate'], [0, 'Poor'] ],

    // Approximate storage (GB) for each Step 3 band, used when no exact figure is given.
    STORAGE_BANDS: {
      lt100: 75, '100-250': 200, '250-500': 400, '500-1000': 800, '1000-2000': 1500, gt2000: 3000
    }
  };

  /* ------------------------------------------------------------
     Plans.  `apps` keys: word excel powerpoint outlook gmail
     googleDocs googleSheets googleDrive teams zoom sharepoint
     onedrive dropbox     (0..1)
     `collab` keys: individual sharedFolders coedit networkDrive
     largeFiles remote external (0..1)
     `email.provider`: 'microsoft' | 'google' | 'zoho' | null
     `storage`: perUserGB + pooledGB (total = perUser × users + pooled)
     ------------------------------------------------------------ */
  function mk(o) { return o; }

  var PLANS = [
    mk({ id: 'm365-basic', group: 'm365', provider: 'microsoft', platform: 'Microsoft 365', plan: 'Business Basic',
      pricePerUserMonth: 5.40, billing: 'annual', maxUsers: 300,
      storage: { perUserGB: 1000, pooledGB: 0 }, email: { provider: 'microsoft', label: 'Exchange (50 GB mailbox)' },
      desktopOffice: false, webOffice: true,
      apps: { word: .7, excel: .7, powerpoint: .7, outlook: 1, gmail: .4, googleDocs: .3, googleSheets: .3, googleDrive: .3, teams: 1, zoom: .9, sharepoint: 1, onedrive: 1, dropbox: .4 },
      collab: { individual: 1, sharedFolders: 1, coedit: .9, networkDrive: .8, largeFiles: .8, remote: .95, external: .9 },
      security: .65, admin: .7, growth: .95,
      features: ['Web & mobile Office apps (no desktop install)', 'Teams, SharePoint, OneDrive', 'Business email with Exchange', 'Basic security & MFA'] }),

    mk({ id: 'm365-apps', group: 'm365', provider: 'microsoft', platform: 'Microsoft 365', plan: 'Apps for Business',
      pricePerUserMonth: 8.80, billing: 'annual', maxUsers: 300,
      storage: { perUserGB: 1000, pooledGB: 0 }, email: { provider: null, label: 'No hosted email (bring your own)' },
      desktopOffice: true, webOffice: true,
      apps: { word: 1, excel: 1, powerpoint: 1, outlook: .9, gmail: .4, googleDocs: .3, googleSheets: .3, googleDrive: .3, teams: .3, zoom: .9, sharepoint: .4, onedrive: 1, dropbox: .4 },
      collab: { individual: 1, sharedFolders: .7, coedit: .9, networkDrive: .6, largeFiles: .8, remote: .85, external: .8 },
      security: .5, admin: .6, growth: .8,
      features: ['Desktop Word, Excel, PowerPoint, Outlook', 'OneDrive 1 TB per user', 'No Exchange email — keep your existing email provider'] }),

    mk({ id: 'm365-standard', group: 'm365', provider: 'microsoft', platform: 'Microsoft 365', plan: 'Business Standard',
      pricePerUserMonth: 10.50, billing: 'annual', maxUsers: 300,
      storage: { perUserGB: 1000, pooledGB: 0 }, email: { provider: 'microsoft', label: 'Exchange (50 GB mailbox)' },
      desktopOffice: true, webOffice: true,
      apps: { word: 1, excel: 1, powerpoint: 1, outlook: 1, gmail: .4, googleDocs: .3, googleSheets: .3, googleDrive: .3, teams: 1, zoom: .9, sharepoint: 1, onedrive: 1, dropbox: .4 },
      collab: { individual: 1, sharedFolders: 1, coedit: .95, networkDrive: .8, largeFiles: .8, remote: .95, external: .9 },
      security: .75, admin: .7, growth: .95,
      features: ['Desktop Word, Excel, PowerPoint, Outlook', 'Teams, SharePoint, OneDrive', 'Business email with Exchange', 'Webinars & Microsoft Bookings'] }),

    mk({ id: 'm365-premium', group: 'm365', provider: 'microsoft', platform: 'Microsoft 365', plan: 'Business Premium',
      pricePerUserMonth: 17.60, billing: 'annual', maxUsers: 300,
      storage: { perUserGB: 1000, pooledGB: 0 }, email: { provider: 'microsoft', label: 'Exchange (50 GB mailbox)' },
      desktopOffice: true, webOffice: true,
      apps: { word: 1, excel: 1, powerpoint: 1, outlook: 1, gmail: .4, googleDocs: .3, googleSheets: .3, googleDrive: .3, teams: 1, zoom: .9, sharepoint: 1, onedrive: 1, dropbox: .4 },
      collab: { individual: 1, sharedFolders: 1, coedit: .95, networkDrive: .85, largeFiles: .8, remote: 1, external: .95 },
      security: 1, admin: .75, growth: 1,
      features: ['Everything in Business Standard', 'Intune device management & Defender for Business', 'Conditional Access & advanced threat protection'] }),

    mk({ id: 'gw-starter', group: 'google', provider: 'google', platform: 'Google Workspace', plan: 'Business Starter',
      pricePerUserMonth: 5.90, billing: 'annual',
      storage: { perUserGB: 30, pooledGB: 0 }, email: { provider: 'google', label: 'Gmail (custom domain)' },
      desktopOffice: false, webOffice: false,
      apps: { word: .5, excel: .5, powerpoint: .5, outlook: .5, gmail: 1, googleDocs: 1, googleSheets: 1, googleDrive: 1, teams: .4, zoom: .9, sharepoint: .3, onedrive: .3, dropbox: .4 },
      collab: { individual: 1, sharedFolders: .9, coedit: 1, networkDrive: .6, largeFiles: .7, remote: .95, external: .9 },
      security: .6, admin: .85, growth: .8,
      features: ['Gmail, Docs, Sheets, Slides, Meet', '30 GB storage per user', 'Opens Office files but no desktop Office'] }),

    mk({ id: 'gw-standard', group: 'google', provider: 'google', platform: 'Google Workspace', plan: 'Business Standard',
      pricePerUserMonth: 11.80, billing: 'annual',
      storage: { perUserGB: 2000, pooledGB: 0 }, email: { provider: 'google', label: 'Gmail (custom domain)' },
      desktopOffice: false, webOffice: false,
      apps: { word: .5, excel: .5, powerpoint: .5, outlook: .5, gmail: 1, googleDocs: 1, googleSheets: 1, googleDrive: 1, teams: .4, zoom: .9, sharepoint: .3, onedrive: .3, dropbox: .4 },
      collab: { individual: 1, sharedFolders: 1, coedit: 1, networkDrive: .7, largeFiles: .85, remote: .95, external: .95 },
      security: .75, admin: .85, growth: .85,
      features: ['Gmail, Docs, Sheets, Slides, Meet', '2 TB storage per user', 'Shared drives & meeting recording'] }),

    mk({ id: 'gw-plus', group: 'google', provider: 'google', platform: 'Google Workspace', plan: 'Business Plus',
      pricePerUserMonth: 18.40, billing: 'annual',
      storage: { perUserGB: 5000, pooledGB: 0 }, email: { provider: 'google', label: 'Gmail (custom domain)' },
      desktopOffice: false, webOffice: false,
      apps: { word: .5, excel: .5, powerpoint: .5, outlook: .5, gmail: 1, googleDocs: 1, googleSheets: 1, googleDrive: 1, teams: .4, zoom: .9, sharepoint: .3, onedrive: .3, dropbox: .4 },
      collab: { individual: 1, sharedFolders: 1, coedit: 1, networkDrive: .75, largeFiles: .9, remote: 1, external: 1 },
      security: .9, admin: .85, growth: .9,
      features: ['Everything in Business Standard', '5 TB storage per user', 'Enhanced security, Vault eDiscovery & retention'] }),

    mk({ id: 'zoho-standard', group: 'zoho', provider: 'zoho', platform: 'Zoho Workplace', plan: 'Standard',
      pricePerUserMonth: 2.40, billing: 'annual',
      storage: { perUserGB: 30, pooledGB: 0 }, email: { provider: 'zoho', label: 'Zoho Mail (30 GB mailbox)' },
      desktopOffice: false, webOffice: false,
      apps: { word: .5, excel: .5, powerpoint: .5, outlook: .5, gmail: .3, googleDocs: .6, googleSheets: .6, googleDrive: .5, teams: .2, zoom: .9, sharepoint: .2, onedrive: .2, dropbox: .4 },
      collab: { individual: 1, sharedFolders: .8, coedit: .8, networkDrive: .5, largeFiles: .6, remote: .8, external: .7 },
      security: .55, admin: .6, growth: .6,
      features: ['Zoho Mail, Writer, Sheet, Show, WorkDrive', '30 GB per user', 'Lowest price; smaller ecosystem'] }),

    mk({ id: 'zoho-professional', group: 'zoho', provider: 'zoho', platform: 'Zoho Workplace', plan: 'Professional',
      pricePerUserMonth: 4.80, billing: 'annual',
      storage: { perUserGB: 100, pooledGB: 0 }, email: { provider: 'zoho', label: 'Zoho Mail (50 GB mailbox)' },
      desktopOffice: false, webOffice: false,
      apps: { word: .5, excel: .5, powerpoint: .5, outlook: .5, gmail: .3, googleDocs: .6, googleSheets: .6, googleDrive: .5, teams: .2, zoom: .9, sharepoint: .2, onedrive: .2, dropbox: .4 },
      collab: { individual: 1, sharedFolders: .85, coedit: .85, networkDrive: .55, largeFiles: .65, remote: .85, external: .75 },
      security: .65, admin: .6, growth: .65,
      features: ['Zoho Mail, Writer, Sheet, Show, WorkDrive, Cliq', '100 GB per user', 'Larger mailbox & more admin controls'] }),

    mk({ id: 'dropbox-business', group: 'dropbox', provider: 'dropbox', platform: 'Dropbox', plan: 'Business',
      pricePerUserMonth: 12.00, billing: 'annual', minUsers: 3,
      storage: { perUserGB: 0, pooledGB: 9000 }, email: { provider: null, label: 'No email (bring your own)' },
      desktopOffice: false, webOffice: false,
      apps: { word: .4, excel: .4, powerpoint: .4, outlook: .3, gmail: .3, googleDocs: .3, googleSheets: .3, googleDrive: .4, teams: .2, zoom: .9, sharepoint: .3, onedrive: .3, dropbox: 1 },
      collab: { individual: 1, sharedFolders: 1, coedit: .6, networkDrive: .9, largeFiles: 1, remote: .9, external: 1 },
      security: .7, admin: .85, growth: .6,
      features: ['9 TB pooled storage (3+ users)', 'Excellent file sync, large files & client sharing', 'No email or Office apps included'] }),

    mk({ id: 'dropbox-office', group: 'dropbox-office', provider: 'dropbox', platform: 'Dropbox + Microsoft 365 Apps', plan: 'Business + Apps for Business',
      pricePerUserMonth: 20.80, billing: 'annual', minUsers: 3, maxUsers: 300,
      components: ['Dropbox Business £12.00', 'Microsoft 365 Apps for Business £8.80'],
      storage: { perUserGB: 1000, pooledGB: 9000 }, email: { provider: null, label: 'No hosted email (bring your own)' },
      desktopOffice: true, webOffice: true,
      apps: { word: 1, excel: 1, powerpoint: 1, outlook: .9, gmail: .4, googleDocs: .3, googleSheets: .3, googleDrive: .4, teams: .3, zoom: .9, sharepoint: .4, onedrive: 1, dropbox: 1 },
      collab: { individual: 1, sharedFolders: 1, coedit: .85, networkDrive: .9, largeFiles: 1, remote: .9, external: 1 },
      security: .7, admin: .55, growth: .65,
      features: ['Dropbox file sync + desktop Office apps', 'Two vendors to manage and pay', 'Keep your existing email provider'] })
  ];

  // Map Step 1 answers to the provider used to assess "stay where you are".
  var CURRENT_PROVIDER = { google: 'google', microsoft: 'microsoft', zoho: 'zoho', dropbox: 'dropbox' };

  var data = { CONFIG: CONFIG, PLANS: PLANS, CURRENT_PROVIDER: CURRENT_PROVIDER };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  root.CloudAdvisorData = data;
})(typeof window !== 'undefined' ? window : globalThis);
