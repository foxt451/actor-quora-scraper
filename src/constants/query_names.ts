import { QueryType } from "../types/query_types.js";

// maps query types to their names in graphQL
export const graphQLqueryNames: Record<QueryType, string> = {
    [QueryType.SEARCH]: "SearchResultsListQuery",
} as const;
