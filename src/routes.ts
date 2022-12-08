import { createBasicRouter, Dataset } from "crawlee";
import { gotScraping } from "got-scraping";
import { BASE_URL, paginationParams } from "./constants/api.js";
import { QUERY_EXTENSIONS } from "./constants/extension_codes.js";
import { constructGraphQLRequest } from "./helpers/api.js";
import { parseSearchResult } from "./helpers/parseSearchResult.js";
import { scrapeHashes } from "./helpers/scrape_hash.js";
import { scrapeHeaders } from "./helpers/scrape_headers.js";
import { NecessaryHeaders } from "./types/header_collection.js";
import { QueryType } from "./types/query_types.js";

export const router = createBasicRouter();

// this middleware gets various anti-scraping tokens and cookies for each session
// additionaly, it grabs extension hash for Search query so as not to make
// additional requests to homepage later
router.use(async ({ session, log }) => {
    // no cookies for this session yet
    console.log('id', session?.id);

    if (session && session.getCookies(BASE_URL).length === 0) {
        log.debug(`Attaching cookies and headers for sesssion: ${session.id}`);
        const response = await gotScraping({
            method: "GET",
            url: BASE_URL,
        });
        session.setCookiesFromResponse(response);
        const headers: NecessaryHeaders = {
            "Content-Type": "application/json",
            ...scrapeHeaders(response.body),
        };
        session.userData.headers = headers;

        // the first session during execution will stumble upon not fresh hashes
        const staleHashes: QueryType[] = Object.keys(QUERY_EXTENSIONS).filter(
            (queryType) => !QUERY_EXTENSIONS[queryType as QueryType].isFresh
        ) as QueryType[];

        const newHashes = await scrapeHashes(response.body, staleHashes);
        for (const { hash, opType } of newHashes) {
            if (hash) {
                QUERY_EXTENSIONS[opType] = {
                    hash,
                    isFresh: true,
                };
            }
        }
    }
});

// construct request payload utilizing hash.
// Payload is constructed only before request execution here, because
// the extension hash might be updated when processing other requests
// therefore, it's better to store all payload without the hash in userData
// and only before execution inject extension hash
router.use(({ request }) => {
    if (request.userData.operationType !== undefined) {
        request.userData.initialPayload.extensions = {
            hash: QUERY_EXTENSIONS[request.userData.operationType as QueryType]
                .hash,
        };
    }
    request.payload = JSON.stringify(request.userData.initialPayload);
});

router.addDefaultHandler(async ({ log, request, sendRequest }) => {
    const { url } = request;
    log.info(`Processing ${url}... Default handler`);

    const { body } = await sendRequest();
    log.info(body);
});

router.addHandler(
    QueryType.SEARCH.toString(),
    async ({ sendRequest, session, crawler, request, log }) => {
        const { body } = await sendRequest({
            headers: session?.userData.headers,
        });

        const { pageInfo, questions } = parseSearchResult(JSON.parse(body));

        await Dataset.pushData(questions);

        log.info(`Scraped ${questions.length} questions from search`);

        if (pageInfo.hasNextPage) {
            await crawler.addRequests([
                constructGraphQLRequest(QueryType.SEARCH, {
                    after: pageInfo.endCursor,
                    first: paginationParams.searchBatch,
                    query: request.userData.initialPayload.variables.query,
                }),
            ]);
        }
    }
);
