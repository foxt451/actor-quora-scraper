export const BASE_URL = (langCode: string) => `https://${langCode}.quora.com`;

export const PAGINATION_PARAMS = {
    // for some reason is capped at 10 for question search, same with answers, limited to 50 apparently
    PAGINATION_BATCH: 100,
} as const;
