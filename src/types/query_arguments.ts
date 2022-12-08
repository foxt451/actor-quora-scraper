// arguments denote what can be passed by user/scraper to create payload, variables denote
// what will actually be sent with the payload, including various non-configurable boilerplate variables

export type SearchQueryArguments = {
    query: string;
    first: number;
    after: string;
};

export type SearchQueryVariables = SearchQueryArguments & {
    tribeId: null;
    time: "all_times";
    author: null;
    resultType: string;
    disableSpellCheck: null;
};
