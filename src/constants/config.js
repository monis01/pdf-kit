export const APP_CONFIG = {
    name: 'PDF Toolkit Hub',
    version: '1.0.0',
    description: 'Professional PDF processing tools',

    // File size limits (in bytes)
    FILE_LIMITS: {
        FREE: 10 * 1024 * 1024,    // 10MB
        PRO: 100 * 1024 * 1024     // 100MB
    },
    // Feature gates
    FEATURES: {
        FREE: ['split-basic', 'merge-2files', 'compress-pdf'],
        PRO: ['split-advanced', 'merge-unlimited', 'compress', 'batch-processing']
    },

    URLS: {
        stripe: 'https://buy.stripe.com/your-link-here',
        privacy: '/privacy',
        terms: '/terms',
        support: 'mailto:support@pdftoolkithub.com'
    },

    ANALYTICS: {
        googleAnalyticsId: 'GA_MEASUREMENT_ID',
        trackingEnabled: true
    },

    ADS: {
        googleAdSenseId: 'ca-pub-XXXXXXXXXXXXXXXX',
        adBlockerDetection: true
    }
}

export const TOOL_ROUTES = {

    HOME: '/',
    SPLIT: '/split',
    MERGE: '/merge',
    COMPRESS: '/compress',
    PRICING: '/pricing',
    PRIVACY: '/privacy'
}

export const USER_TIERS = {
    FREE: 'free',
    PRO: 'pro'
};