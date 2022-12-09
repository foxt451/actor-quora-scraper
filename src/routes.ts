import { createBasicRouter, Dataset } from "crawlee";
import { PAGINATION_PARAMS } from "./constants/api.js";
import { DEFAULT_QUERY_EXTENSIONS } from "./constants/extension_codes.js";
import { constructGraphQLRequest } from "./helpers/api.js";
import { mergePageData } from "./helpers/merge_page_data.js";
import { parseQuestionAnswersPage } from "./page_scrapers/parse_question_answers_page.js";
import { parseSearchResult } from "./page_scrapers/parse_search_result.js";
import { scrapeCookies } from "./page_scrapers/scrape_cookies.js";
import { CrawlerState } from "./types/crawler_state.js";
import { nonConfigurableQueryArguments } from "./types/query_arguments.js";
import { QueryType } from "./types/query_types.js";

export const router = createBasicRouter();

const defaultCrawlerState: CrawlerState = {
    extensionCodes: DEFAULT_QUERY_EXTENSIONS,
};

// this middleware gets various anti-scraping tokens and cookies for each session
// additionaly, it grabs extension hash for Search query so as not to make
// additional requests to homepage later

// avoid race condition by making other session requests wait for the first request that went to scrape cookies
// this avoids concurrent session requests hitting home page to scrape cookies multiple times
const scrapeCookiesPromiseMap: Map<string, Promise<void>> = new Map();
router.use(async ({ session, log, crawler }) => {
    const crawlerState = await crawler.useState(defaultCrawlerState);
    if (session && !scrapeCookiesPromiseMap.get(session.id)) {
        const scrapeCookiesPromise = scrapeCookies(session, log, crawlerState);
        scrapeCookiesPromiseMap.set(session.id, scrapeCookiesPromise);
        await scrapeCookiesPromise;
    } else if (session) {
        await scrapeCookiesPromiseMap.get(session.id);
    }
});

router.use(async ({ request, crawler }) => {
    const crawlerState = await crawler.useState(defaultCrawlerState);
    if (request.userData.operationType !== undefined) {
        request.userData.initialPayload.extensions = {
            hash: crawlerState.extensionCodes[
                request.userData.operationType as QueryType
            ].hash,
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
                    first: PAGINATION_PARAMS.PAGINATION_BATCH,
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
                    first: PAGINATION_PARAMS.PAGINATION_BATCH,
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
                    first: PAGINATION_PARAMS.PAGINATION_BATCH,
                    qid,
                    ...nonConfigurableQueryArguments[
                        QueryType.QUESTION_ANSWERS
                    ],
                }),
            ]);
        }
    }
);
