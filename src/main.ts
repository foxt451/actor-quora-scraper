/**
 * This template is a production ready boilerplate for developing with `CheerioCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

// For more information, see https://sdk.apify.com
import { Actor } from "apify";
// For more information, see https://crawlee.dev
import { BasicCrawler } from "crawlee";
import { PAGINATION_PARAMS } from "./constants/api.js";
import { ERROR_MESSAGES } from "./constants/error_messages.js";
import { constructGraphQLRequest } from "./helpers/index.js";
import { router } from "./routes.js";
import { Input } from "./types/input.js";
import { nonConfigurableQueryArguments } from "./types/query_arguments.js";
import { QueryType } from "./types/query_types.js";

// Initialize the Apify SDK
await Actor.init();

const input = await Actor.getInput<Input>();
if (!input) {
    throw new Error(ERROR_MESSAGES.INPUT_EMPTY);
}

const { query, proxy } = input;

export const proxyConfiguration = await Actor.createProxyConfiguration(proxy);

const crawler = new BasicCrawler({
    requestHandler: router,
    // use multiple sessions to enable quick concurrent scraping
    // without getting noticed by Quora's rate limiting
    useSessionPool: true,
    sessionPoolOptions: {
        // the following options are those that have been tested multiple times to work;
        // if this actor gets traction, you might enable their customization;

        // several sessions have proved to be enough
        // too few sessions might slow down the crawl or fall under rate limiting
        maxPoolSize: 10,
        sessionOptions: {
            // a single session is able to last indefinitely without getting blocked
            maxAgeSecs: 9999999,
            // just as a precaution, however, let's change a session after 100 requests so as not to
            // arouse suspicion
            maxUsageCount: 100,
        },
    },
});

await crawler.run([
    constructGraphQLRequest(QueryType.SEARCH, {
        after: "0",
        first: PAGINATION_PARAMS.PAGINATION_BATCH,
        query,
        ...nonConfigurableQueryArguments[QueryType.SEARCH],
    }),
]);

// Exit successfully
await Actor.exit();
