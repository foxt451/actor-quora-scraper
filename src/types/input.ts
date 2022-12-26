import { ProxyConfigurationOptions } from "apify";
import { AnswersRanking } from "./query_arguments";

export type Input = {
    query: string;
    proxy?: ProxyConfigurationOptions & {
        useApifyProxy?: boolean;
    };
    answersBatchSize: number | undefined;
    maxAnswersPerQuestion: number | undefined;
    answersRanking: AnswersRanking | undefined;
    maxPoolSize: number | undefined;
    maxAgeSecs: number | undefined;
    maxUsageCount: number | undefined;
};
