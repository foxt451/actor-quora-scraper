import { BASE_URL } from "../constants/api.js";
import { parseJsonContent } from "./parseJsonContent.js";
import { unixToDateIso } from "./unixToDateIso.js";

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
        const { qid, id, url, title, creationTime, answerCount } =
            edge.node.question;
        const question: Record<string, unknown> = {
            qid,
            id,
            url: `${BASE_URL}${url}`,
            title: parseJsonContent(title),
            originalTitle: title,
            creationTime: unixToDateIso(creationTime),
            answerCount,
        };
        return question;
    });
    return {
        pageInfo,
        questions,
    };
};
