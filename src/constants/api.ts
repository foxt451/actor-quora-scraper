export const BASE_URL = `https://www.quora.com`;

export const paginationParams = {
    // server will still return 10 for some reason
    searchBatch: 100,
} as const;
