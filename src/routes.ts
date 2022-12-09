import { createBasicRouter, Dataset } from "crawlee";
import { gotScraping } from "got-scraping";
import { BASE_URL, PAGINATION_PARAMS } from "./constants/api.js";
import { QUERY_EXTENSIONS } from "./constants/extension_codes.js";
import { constructGraphQLRequest } from "./helpers/api.js";
import { mergePageData } from "./helpers/mergePageData.js";
import { parseQuestionAnswersPage } from "./helpers/parseQuestionAnswersPage.js";
import { parseSearchResult } from "./helpers/parseSearchResult.js";
import { scrapeHashes } from "./helpers/scrape_hash.js";
import { scrapeHeaders } from "./helpers/scrape_headers.js";
import { NecessaryHeaders } from "./types/header_collection.js";
import { nonConfigurableQueryArguments } from "./types/query_arguments.js";
import { QueryType } from "./types/query_types.js";

export const router = createBasicRouter();

// this middleware gets various anti-scraping tokens and cookies for each session
// additionaly, it grabs extension hash for Search query so as not to make
// additional requests to homepage later
router.use(async ({ session, log }) => {
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
    QueryType.SEARCH,
    async ({ sendRequest, session, crawler, request, log }) => {
        const { body } = await sendRequest({
            headers: session?.userData.headers,
        });

        const { pageInfo, questions } = parseSearchResult(JSON.parse(body));

        await Dataset.pushData(questions);

        log.info(`Scraped ${questions.length} questions from search`);

        for (const question of questions) {
            await crawler.addRequests([
                constructGraphQLRequest(QueryType.QUESTION_ANSWERS, {
                    after: "0",
                    qid: question.qid,
                    first: PAGINATION_PARAMS.SEARCH_BATCH,
                    ...nonConfigurableQueryArguments[
                        QueryType.QUESTION_ANSWERS
                    ],
                }),
            ]);
        }

        if (pageInfo.hasNextPage) {
            await crawler.addRequests([
                constructGraphQLRequest(QueryType.SEARCH, {
                    after: pageInfo.endCursor,
                    first: PAGINATION_PARAMS.SEARCH_BATCH,
                    query: request.userData.initialPayload.variables.query,
                    ...nonConfigurableQueryArguments[QueryType.SEARCH],
                }),
            ]);
        }
    }
);

router.addHandler(
    QueryType.QUESTION_ANSWERS,
    async ({ sendRequest, session, request, log, crawler }) => {
        const { body } = await sendRequest({
            headers: session?.userData.headers,
        });

        const { pageInfo, answers } = parseQuestionAnswersPage(
            JSON.parse(body)
        );
        const { qid } = request.userData.initialPayload.variables;
        const key = `qid_${qid}_answers.json`;
        await mergePageData(key, answers);
        log.info(
            `Scraped ${answers.length} answers from a question with qid: ${qid}. Saved to KeyValueStore with key: ${key}`
        );
        if (pageInfo.hasNextPage) {
            await crawler.addRequests([
                constructGraphQLRequest(QueryType.QUESTION_ANSWERS, {
                    after: pageInfo.endCursor,
                    first: PAGINATION_PARAMS.SEARCH_BATCH,
                    qid,
                    ...nonConfigurableQueryArguments[
                        QueryType.QUESTION_ANSWERS
                    ],
                }),
            ]);
        }
    }
);
