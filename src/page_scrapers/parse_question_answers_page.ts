import { Log } from "apify";
import { combineUrl } from "../helpers/combine_url.js";
import { parseJsonContent } from "../helpers/parse_json_content.js";
import { unixToDateIso } from "../helpers/unixToDateIso.js";
import { AnswerInfo } from "../types/parser_results.js";

// endpoint for question answers returns some other entities, so it's needed to filter by typename
const ANSWER_TYPENAME = "QuestionAnswerItem";

// API responses typed as any deliberately because API is complex and subject to change
export const parseQuestionAnswersPage = (
    result: any,
    log: Log
): {
    answers: AnswerInfo[];
    pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
    };
} => {
    const { edges, pageInfo } = result.data.question.pagedListDataConnection;
    let failedAnswersNum = 0;
    const answers: AnswerInfo[] = [];
    for (const edge of edges) {
        try {
            // eslint-disable-next-line no-underscore-dangle
            if (!edge.node.__typename.includes(ANSWER_TYPENAME)) {
                continue;
            }

            const {
                aid,
                id,
                content,
                creationTime,
                url,
                numUpvotes,
                numViews,
                question: { qid },
                author: { isAnon: isAuthorAnon, uid, profileUrl, names },
            } = edge.node.answer;
            const answer: AnswerInfo = {
                aid,
                id,
                url: combineUrl(url),
                content: parseJsonContent(content),
                originalContent: content,
                creationTime: unixToDateIso(creationTime),
                numUpvotes,
                numViews,
                qid,
                isAuthorAnon,
                uid,
                profileUrl: combineUrl(profileUrl),
                names: names.map((nameInfo: any) => ({
                    givenName: nameInfo.givenName,
                    familyName: nameInfo.familyName,
                })),
            };
            answers.push(answer);
        } catch {
            log.debug(
                `Failed to parse (or reliably determine the typename of) the following object as an answer edge: ${JSON.stringify(
                    edge
                )}`
            );
            failedAnswersNum++;
        }
        if (failedAnswersNum > 0) {
            log.error(
                `Failed to parse ${failedAnswersNum} answer(s). Turn on DEBUG logs to see what objects the crawler tried to extract info from, but couldn't.`
            );
        }
    }
    return { answers, pageInfo };
};
