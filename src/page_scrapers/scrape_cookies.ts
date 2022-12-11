import { Log } from "apify";
import { Session } from "crawlee";
import { gotScraping, OptionsOfTextResponseBody } from "got-scraping";
import { BASE_URL } from "../constants/api.js";
import { proxyConfiguration } from "../main.js";
import { CrawlerState } from "../types/crawler_state.js";
import { NecessaryHeaders } from "../types/header_collection.js";
import { QueryType } from "../types/query_types.js";
import { scrapeHashes } from "./scrape_hash.js";
import { scrapeHeaders } from "./scrape_headers.js";

export const scrapeCookies = async (
    session: Session,
    log: Log,
    crawlerState: CrawlerState
): Promise<void> => {
    log.info(
        `Attaching cookies and headers for current sesssion: ${session.id}...`
    );
    // you have to cast options to this type because typings of the library
    // don't support proxyUrl, see this issue: https://github.com/apify/got-scraping/issues/66
    const response = await gotScraping({
        method: "GET",
        url: BASE_URL,
        proxyUrl: await proxyConfiguration.newUrl(session.id),
    } as OptionsOfTextResponseBody);
    session.setCookiesFromResponse(response);
    const headers: NecessaryHeaders = {
        "Content-Type": "application/json",
        ...scrapeHeaders(response.body),
    };
    session.userData.headers = headers;

    // the first session during execution will stumble upon not fresh hashes
    const staleHashes: QueryType[] = Object.keys(
        crawlerState.extensionCodes
    ).filter(
        (queryType) =>
            !crawlerState.extensionCodes[queryType as QueryType].isFresh
    ) as QueryType[];

    const newHashes = await scrapeHashes(response.body, staleHashes);
    for (const { hash, opType } of newHashes) {
        if (hash) {
            crawlerState.extensionCodes[opType] = {
                hash,
                isFresh: true,
            };
        }
    }
    log.info(
        `Attached cookies and headers for current sesssion: ${session.id}`
    );
};
