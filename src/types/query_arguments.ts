import { QueryType } from "./query_types.js";

export type QueryArguments = {
    [QueryType.SEARCH]: {
        query: string;
        first: number;
        after: string | null;
        tribeId: null;
        time: "all_times";
        author: null;
        resultType: "question";
        disableSpellCheck: null;
    };
    [QueryType.QUESTION_ANSWERS]: {
        qid: string | number;
        first: number;
        after: string | null;
        forceScoreVersion: string;
    };
};

export type AdditionalUserData = {
    [QueryType.SEARCH]: {
        maxAnswersPerQuestion: number;
        answersBatchSize: number;
        answersRanking: AnswersRanking;
    };
    [QueryType.QUESTION_ANSWERS]: {
        maxAnswersPerQuestion: number;
        answersBatchSize: number;
        answersRanking: AnswersRanking;
    };
};

export type AnswersRanking =
    | "hide_relevant_answers"
    | "ranking_toggle_upvote"
    | "ranking_toggle_recency";

export const nonConfigurableQueryArguments = {
    [QueryType.SEARCH]: {
        tribeId: null,
        time: "all_times",
        author: null,
        resultType: "question",
        disableSpellCheck: null,
    },
    [QueryType.QUESTION_ANSWERS]: {},
} as const;
