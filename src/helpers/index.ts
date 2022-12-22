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

export const removeDuplicatesByProperty = <
    T extends { [k in K]: string | number | symbol },
    K extends keyof T
>(
    objects: T[],
    key: K
): T[] => {
    const uniqueObjects = objects.reduce((acc, obj) => {
        if (!acc[obj[key]]) {
            acc[obj[key]] = obj;
        }
        return acc;
    }, {} as { [key in T[K]]: T });

    return Object.values(uniqueObjects);
};

export const constructAnswersKVKey = (qid: string): string => {
    return `qid_${qid}_answers`;
};

export const isAnswersKVKey = (
    key: string
): { is: false; qid: null } | { is: true; qid: string } => {
    if (key.startsWith("qid_") && key.endsWith("_answers")) {
        return {
            is: true,
            qid: key.replace("qid_", "").replace("_answers", ""),
        };
    }
    return {
        is: false,
        qid: null,
    };
};
