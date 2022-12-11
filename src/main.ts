/**
 * This template is a production ready boilerplate for developing with `CheerioCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

// For more information, see https://sdk.apify.com
import { Actor } from "apify";
// For more information, see https://crawlee.dev
import { BasicCrawler, ProxyConfiguration } from "crawlee";
import { PAGINATION_PARAMS } from "./constants/api.js";
import { ERROR_MESSAGES } from "./constants/error_messages.js";
import { constructGraphQLRequest } from "./helpers/api.js";
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

export const proxyConfiguration =
    (await Actor.createProxyConfiguration(proxy)) ?? new ProxyConfiguration();

const crawler = new BasicCrawler({
    requestHandler: router,
    useSessionPool: true,
    sessionPoolOptions: {
        maxPoolSize: 1,
        sessionOptions: {
            maxAgeSecs: 9999999,
            maxUsageCount: 9999999,
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
