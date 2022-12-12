import { log } from "apify";
import { gotScraping } from "got-scraping";
import { QueryType } from "../types/query_types.js";

export const scrapeHashes = async (
    html: string,
    operationTypes: QueryType[]
): Promise<{ opType: QueryType; hash: string | null }[]> => {
    return Promise.all(
        operationTypes.map(async (opType) => ({
            hash: await scrapeHash(html, opType),
            opType,
        }))
    );
};

const scrapeHash = async (
    html: string,
    operationType: QueryType
): Promise<string | null> => {
    const url =
        new RegExp(`"(http[^"]*?${operationType}.*?webpack)"`).exec(
            html
        )?.[1] ?? null;

    if (!url) {
        return null;
    }
    try {
        const webpack = await gotScraping(url);
        const hash = /id:"(.*?)"/.exec(webpack.body)?.[1] ?? null;
        return hash;
    } catch (e) {
        // idea: add retry logic here and in other places
        log.warning(
            `Failed to scrape fresh hash from ${url}, using the old one`
        );
        if (e instanceof Error) {
            log.debug(`${e.name}: ${e.message}`);
        }
        return null;
    }
};
