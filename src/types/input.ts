import { ProxyConfigurationOptions } from "apify";
import { AnswersRanking } from "./query_arguments";

export type Input = {
    queries: string[];
    proxy?: ProxyConfigurationOptions & {
        useApifyProxy?: boolean;
    };
    languageCode?: string;
    maxAnswersPerQuestion: number | undefined;
    answersRanking: AnswersRanking | undefined;
    maxPoolSize: number | undefined;
    maxAgeSecs: number | undefined;
    maxUsageCount: number | undefined;
    useAnswerDataset?: boolean
};
