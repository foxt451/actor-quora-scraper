import { gotScraping } from "got-scraping";
import { graphQLqueryNames } from "../constants/query_names.js";
import { QueryType } from "../types/query_types.js";

export const scrapeHash = async (
    html: string,
    operationType: QueryType
): Promise<string | null> => {
    const url =
        new RegExp(`"(http[^"]*?${graphQLqueryNames[operationType]}.*?webpack)"`).exec(
            html
        )?.[1] ?? null;

    if (!url) {
        return null;
    }
    const webpack = await gotScraping(url);
    const hash = /id:"(.*?)"/.exec(webpack.body)?.[1] ?? null;

    return hash;
};
