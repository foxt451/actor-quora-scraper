import { RequestOptions } from "crawlee";
import { BASE_URL } from "../constants/api.js";
import {
    AdditionalUserData,
    QueryArguments,
} from "../types/query_arguments.js";
import { QueryType } from "../types/query_types.js";

export const constructGraphQLRequest = <T extends QueryType>(
    queryType: T,
    langCode: string,
    queryArgs: QueryArguments[T],
    // it's necessary to separate user data from query variables
    // since the latter is passed into payload as a whole
    // while the former is only used in the crawler
    additionalUserData: AdditionalUserData[T]
): RequestOptions => {
    const url = constructGraphQLUrl(queryType, langCode);

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
            additional: additionalUserData,
        },
        label: queryType.toString(),
    };
};

export type UserData<T extends QueryType> = {
    initialPayload: {
        queryName: T;
        variables: QueryArguments[T];
    };
    operationType: T;
    additional: AdditionalUserData[T];
};

const constructGraphQLUrl = (queryType: QueryType, langCode: string): string => {
    return `${BASE_URL(langCode)}/graphql/gql_para_POST?q=${queryType}`;
};

export const parseJsonContent = (contentObj: string): string => {
    const matches = [...contentObj.matchAll(/"text":[ ]?"(.*?)"/g)];
    if (matches.length === 0) {
        return contentObj;
    }
    return matches.map((match) => match[1]).join("");
};

export const combineUrl = (url: string, langCode: string): string => {
    return new URL(url, BASE_URL(langCode)).toString();
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
