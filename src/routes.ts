import { createBasicRouter, Dataset } from "crawlee";
import { PAGINATION_PARAMS } from "./constants/api.js";
import { DEFAULT_QUERY_EXTENSIONS } from "./constants/extension_codes.js";
import { constructGraphQLRequest } from "./helpers/api.js";
import { mergePageData } from "./helpers/merge_page_data.js";
import { proxyConfiguration } from "./main.js";
import { parseQuestionAnswersPage } from "./page_scrapers/parse_question_answers_page.js";
import { parseSearchResult } from "./page_scrapers/parse_search_result.js";
import { scrapeCookies } from "./page_scrapers/scrape_cookies.js";
import { CrawlerState } from "./types/crawler_state.js";
import { AnswerInfo, PageInfo, QuestionInfo } from "./types/parser_results.js";
import { nonConfigurableQueryArguments } from "./types/query_arguments.js";
import { QueryType } from "./types/query_types.js";

export const router = createBasicRouter();

const defaultCrawlerState: CrawlerState = {
    extensionCodes: DEFAULT_QUERY_EXTENSIONS,
};

// this middleware gets various anti-scraping tokens and cookies for each session;
// additionaly, it grabs extension hash for persisted queries so as not to make
// additional requests to homepage later

// this map is to avoid race condition by making other session requests wait for the first request that went to scrape cookies;
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

router.use(async ({ request, crawler, log, session }) => {
    const crawlerState = await crawler.useState(defaultCrawlerState);
    if (request.userData.operationType !== undefined) {
        request.userData.initialPayload.extensions = {
            hash: crawlerState.extensionCodes[
                request.userData.operationType as QueryType
            ].hash,
        };
    }
    // only form actual request payload before executing request, not when adding it to the queue;
    // this is because a request might stay in the queue for some time, during which the extension hash
    // for this graphQL operation has changed;
    // like for the first request, when it's added to the queue first and only after are cookies and extension hashes
    // scraped (in the previous middleware)
    request.payload = JSON.stringify(request.userData.initialPayload);
    log.debug(
        `Headers of request ${request.id}: ${JSON.stringify(
            session?.userData.headers
        )}; payload: ${request.payload}`
    );
});

router.addHandler(
    QueryType.SEARCH,
    async ({ sendRequest, session, crawler, request, log }) => {
        const proxyUrl =
            proxyConfiguration &&
            (await proxyConfiguration.newUrl(session?.id));
        log.debug(
            `Selected ${proxyUrl} as proxy url for request id: ${request.id}`
        );
        const { body, statusCode, headers } = await sendRequest({
            headers: session?.userData.headers,
            // when using BasicCrawler, you have to attach proxy manually
            proxyUrl,
        });

        let pageInfo: PageInfo;
        let questions: QuestionInfo[];
        try {
            ({ pageInfo, questions } = parseSearchResult(
                JSON.parse(body),
                log
            ));
        } catch (e) {
            log.debug(
                `Failed to parse the following questions endpoint response: ${body}. The response code and headers: ${statusCode}; ${JSON.stringify(
                    headers
                )}. Proxy used: ${proxyUrl}`
            );
            log.error(
                "Failed to parse the response body for questions as a whole. Turn on DEBUG logs to see what the response was."
            );
            throw e;
        }

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
    async ({ sendRequest, session, request, log, crawler, proxyInfo }) => {
        const proxyUrl =
            proxyConfiguration &&
            (await proxyConfiguration.newUrl(session?.id));
        log.debug(
            `Selected ${proxyUrl} as proxy url for request id: ${request.id}`
        );
        const { body, statusCode, headers } = await sendRequest({
            headers: session?.userData.headers,
            proxyUrl,
        });

        let pageInfo: PageInfo;
        let answers: AnswerInfo[];
        try {
            ({ pageInfo, answers } = parseQuestionAnswersPage(
                JSON.parse(body),
                log
            ));
        } catch (e) {
            log.debug(
                `Failed to parse the following answers endpoint response: ${body}. The response code and headers: ${statusCode}; ${JSON.stringify(
                    headers
                )}. Proxy used: ${proxyInfo?.url}`
            );
            log.error(
                "Failed to parse the response body for answers as a whole. Turn on DEBUG logs to see what the response was."
            );
            throw e;
        }
        const { qid } = request.userData.initialPayload.variables;
        const key = `qid_${qid}_answers`;
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
