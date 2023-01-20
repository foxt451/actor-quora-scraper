import { Actor } from "apify";
import { BasicCrawler } from "crawlee";
import cuid from 'cuid';
import { PAGINATION_PARAMS } from "./constants/api.js";
import { ERROR_MESSAGES } from "./constants/error_messages.js";
import { constructGraphQLRequest } from "./helpers/index.js";
import { router } from "./routes.js";
import { answerStore } from "./stores/answers_store.js";
import { Input } from "./types/input.js";
import { nonConfigurableQueryArguments } from "./types/query_arguments.js";
import { QueryType } from "./types/query_types.js";

// Initialize the Apify SDK
await Actor.init();

const input = await Actor.getInput<Input>();
if (!input) {
    throw new Error(ERROR_MESSAGES.INPUT_EMPTY);
}

const {
    queries,
    proxy,
    maxAgeSecs = 999999999,
    maxPoolSize = 10,
    maxUsageCount = 200,
    maxAnswersPerQuestion,
    answersRanking,
    useAnswerDataset = false,
} = input;

export const proxyConfiguration = await Actor.createProxyConfiguration(
    proxy ?? {
        useApifyProxy: false,
    }
);

const answerDataset = useAnswerDataset
    ? await Actor.openDataset(`ANSWERS-${cuid}`)
    : undefined;

const crawler = new BasicCrawler({
    requestHandler: (context) => router({ ...context, answerDataset }),
    // use multiple sessions to enable quick concurrent scraping
    // without getting noticed by Quora's rate limiting
    useSessionPool: true,
    sessionPoolOptions: {
        // the following options are those that have been tested multiple times to work;
        // if this actor gets traction, you might enable their customization;

        // several sessions have proved to be enough
        // too few sessions might slow down the crawl or fall under rate limiting
        maxPoolSize,
        sessionOptions: {
            // a single session is able to last indefinitely without getting blocked
            maxAgeSecs,
            // just as a precaution, however, let's change a session after 100 requests so as not to
            // arouse suspicion
            maxUsageCount,
        },
    },
});

await answerStore.initialize();

await crawler.run(
    queries.map((query) =>
        constructGraphQLRequest(
            QueryType.SEARCH,
            {
                after: null,
                first: PAGINATION_PARAMS.PAGINATION_BATCH,
                query,
                ...nonConfigurableQueryArguments[QueryType.SEARCH],
            },
            {
                maxAnswersPerQuestion: maxAnswersPerQuestion ?? -1,
                answersBatchSize: PAGINATION_PARAMS.PAGINATION_BATCH,
                answersRanking: answersRanking ?? "hide_relevant_answers",
            }
        )
    )
);

// Exit successfully
await Actor.exit();
