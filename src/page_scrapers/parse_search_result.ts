import { Log } from "apify";
import {
    combineUrl,
    parseJsonContent,
    unixToDateIso,
} from "../helpers/index.js";
import { PageInfo, QuestionInfo } from "../types/parser_results.js";

// API responses typed as any deliberately because API is complex and subject to change
export const parseSearchResult = (
    result: any,
    log: Log
): {
    questions: QuestionInfo[];
    pageInfo: PageInfo;
} => {
    const { edges, pageInfo } = result.data.searchConnection;
    let failedQuestionsNum = 0;
    const questions: QuestionInfo[] = [];
    for (const edge of edges) {
        try {
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
            questions.push(question);
        } catch (e) {
            log.debug(
                `Failed to parse the following object as a question edge: ${JSON.stringify(
                    edge
                )}`
            );
            if (e instanceof Error) {
                log.debug(`${e.name}: ${e.message}`);
            }
            failedQuestionsNum++;
        }
    }
    if (failedQuestionsNum > 0) {
        log.warning(
            `Failed to parse ${failedQuestionsNum} question(s). Turn on DEBUG logs to see what objects the crawler tried to extract info from, but couldn't`
        );
    }
    return {
        pageInfo,
        questions,
    };
};
