import { Actor } from "apify";
import { RequestOptions } from "crawlee";
import { BASE_URL } from "../constants/api.js";
import { QueryArguments } from "../types/query_arguments.js";
import { QueryType } from "../types/query_types.js";

export const constructGraphQLRequest = <T extends QueryType>(
    queryType: T,
    queryArgs: QueryArguments[T]
): RequestOptions => {
    const url = constructGraphQLUrl(queryType);

    return {
        uniqueKey: url + JSON.stringify(queryArgs),
        url,
        method: "POST",
        userData: {
            initialPayload: {
                queryName: queryType,
                variables: queryArgs,
            },
            operationType: queryType,
        },
        label: queryType.toString(),
    };
};

const constructGraphQLUrl = (queryType: QueryType): string => {
    return `${BASE_URL}/graphql/gql_para_POST?q=${queryType}`;
};

export const parseJsonContent = (contentObj: string): string => {
    const matches = [...contentObj.matchAll(/"text":[ ]?"(.*?)"/g)];
    if (matches.length === 0) {
        return contentObj;
    }
    return matches.map((match) => match[1]).join("");
};

export const combineUrl = (url: string, base = BASE_URL): string => {
    return new URL(url, base).toString();
};

export const unixToDateIso = (timestamp: number, divider = 1000): string => {
    return new Date(timestamp / divider).toISOString();
};

// helps merge new page data into previous pages already stored in KVStore
export const mergePageData = async (key: string, newData: unknown[]) => {
    const prevData = await Actor.getValue<unknown[]>(key);
    if (prevData) {
        newData = [...prevData, newData];
    }
    // WARNING: in case of many pages, there will be a lot of API calls to the KVStore
    // idea: use in-memory data structure to store answers and only persist it to the store on persistence events
    await Actor.setValue(key, newData);
};
