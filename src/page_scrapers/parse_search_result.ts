import { combineUrl } from "../helpers/combine_url.js";
import { parseJsonContent } from "../helpers/parse_json_content.js";
import { unixToDateIso } from "../helpers/unixToDateIso.js";
import { PageInfo, QuestionInfo } from "../types/parser_results.js";

// API responses typed as any deliberately because API is complex and subject to change
export const parseSearchResult = (
    result: any
): {
    questions: QuestionInfo[];
    pageInfo: PageInfo;
} => {
    const { edges, pageInfo } = result.data.searchConnection;

    const questions: QuestionInfo[] = edges.map((edge: any) => {
        const { qid, id, url, title, creationTime, answerCount } =
            edge.node.question;
        const question: QuestionInfo = {
            qid,
            id,
            url: combineUrl(url),
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
