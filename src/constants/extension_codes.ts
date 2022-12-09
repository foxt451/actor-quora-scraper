import { QueryType } from "../types/query_types.js";

type HashInfo = {
    hash: string;
    isFresh: boolean;
};

// this global object holds hashes, they should ideally be scraped and updated during exectuion
// but if it fails for some reason, it is preinitialized with some manually scraped hashes which might last for some time
export const QUERY_EXTENSIONS: Record<QueryType, HashInfo> = {
    [QueryType.SEARCH]: {
        hash: "9dce4809922a976f52b021ed9bbfb4d49bff450675bad8c8913518b0e100d3c4",
        isFresh: false,
    },
    [QueryType.QUESTION_ANSWERS]: {
        hash: "2421b6b0e11c573d642b6a9b62e7d66631ff0268423ed6c5fe50f7a5f959339b",
        isFresh: false,
    },
};
