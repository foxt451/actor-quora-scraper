import { QueryType } from "./query_types.js";

export type QueryArguments = {
    [QueryType.SEARCH]: {
        query: string;
        first: number;
        after: string;
        tribeId: null;
        time: "all_times";
        author: null;
        resultType: "question";
        disableSpellCheck: null;
    };
    [QueryType.QUESTION_ANSWERS]: {
        qid: number;
        first: number;
        after: string;
        forceScoreVersion: "hide_relevant_answers";
    };
};

export const nonConfigurableQueryArguments = {
    [QueryType.SEARCH]: {
        tribeId: null,
        time: "all_times",
        author: null,
        resultType: "question",
        disableSpellCheck: null,
    },
    [QueryType.QUESTION_ANSWERS]: {
        forceScoreVersion: "hide_relevant_answers",
    },
} as const;
