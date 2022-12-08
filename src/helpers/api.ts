import { RequestOptions } from "crawlee";
import { BASE_URL } from "../constants/api.js";
import { graphQLqueryNames } from "../constants/query_names.js";
import {
    SearchQueryArguments,
    SearchQueryVariables,
} from "../types/query_arguments.js";
import { QueryType } from "../types/query_types.js";

export const constructGraphQLRequest = <T extends QueryType>(
    queryType: T,
    queryVariableArgs: Parameters<typeof constructGraphQLVariables[T]>[0]
): RequestOptions => {
    const url = constructGraphQLUrl(queryType)
    const variables = constructGraphQLVariables[queryType](queryVariableArgs)

    return {
        uniqueKey: url + JSON.stringify(variables),
        url,
        method: "POST",
        userData: {
            initialPayload: {
                queryName: graphQLqueryNames[queryType],
                variables,
            },
            operationType: queryType,
        },
        label: queryType.toString(),
    };
};

const constructGraphQLUrl = (queryType: QueryType): string => {
    return `${BASE_URL}/graphql/gql_para_POST?q=${graphQLqueryNames[queryType]}`;
};

const constructGraphQLVariables = {
    [QueryType.SEARCH]: (args: SearchQueryArguments): SearchQueryVariables => ({
        ...args,
        author: null,
        disableSpellCheck: null,
        resultType: "question",
        time: "all_times",
        tribeId: null,
    }),
} as const;
