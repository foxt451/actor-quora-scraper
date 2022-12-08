import { BASE_URL } from "../constants/api.js";
import { unixToDateIso } from "./unixToDateIso.js";

const scrapableQuestionProperties = [
    "qid",
    "id",
    "url",
    "title",
    "creationTime",
];

const parseTitle = (titleObj: string): string => {
    const matches = /"text":[ ]?"(.*?)"/.exec(titleObj);
    if (!matches) {
        return titleObj;
    }
    return matches.slice(1).join("");
};

export const parseSearchResult = (
    result: any
): {
    questions: any[];
    pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
    };
} => {
    const { edges, pageInfo } = result.data.searchConnection;

    const questions: any[] = edges.map((edge: any) => {
        const question: Record<string, unknown> = {};

        scrapableQuestionProperties.forEach((prop) => {
            question[prop] = edge.node.question[prop];
        });

        question.url = `${BASE_URL}${question.url}`;
        question.title = parseTitle(question.title as string);
        question.creationTime = unixToDateIso(question.creationTime as number);

        return question;
    });
    return {
        pageInfo,
        questions,
    };
};
