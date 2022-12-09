import { combineUrl } from "../helpers/combine_url.js";
import { parseJsonContent } from "../helpers/parse_json_content.js";
import { unixToDateIso } from "../helpers/unixToDateIso.js";

// endpoint for question answers returns some other entities, so it's needed to filter by typename
const ANSWER_TYPENAME = "QuestionAnswerItem";

export const parseQuestionAnswersPage = (
    result: any
): {
    answers: any[];
    pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
    };
} => {
    const { edges, pageInfo } = result.data.question.pagedListDataConnection;
    const answers: any[] = edges
        .filter((edge: any) =>
            // eslint-disable-next-line no-underscore-dangle
            edge.node.__typename.includes(ANSWER_TYPENAME)
        )
        .map((edge: any) => {
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
            const answer: Record<string, unknown> = {
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
            return answer;
        });
    return { answers, pageInfo };
};
