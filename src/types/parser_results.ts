export type QuestionInfo = {
    qid: string | number;
    id: string | number;
    url: string;
    title: string;
    originalTitle: string;
    creationTime: string;
    answerCount: number;
};

export type AnswerInfo = {
    aid: string | number;
    id: string | number;
    url: string;
    content: string;
    originalContent: string;
    creationTime: string;
    numUpvotes: number;
    numViews: number;
    qid: string | number;
    isAuthorAnon: boolean;
    uid: string | number;
    profileUrl: string;
    names: Partial<{
        givenName: string;
        familyName: string;
    }>[];
};

export type PageInfo = {
    hasNextPage: boolean;
    endCursor: string;
};
