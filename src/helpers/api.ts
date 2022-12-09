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
