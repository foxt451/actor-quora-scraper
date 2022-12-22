import { ProxyConfigurationOptions } from "apify";

export type Input = {
    query: string;
    proxy: ProxyConfigurationOptions & {
        useApifyProxy?: boolean;
    };
    sessions?: {
        maxPoolSize: number | undefined;
        maxAgeSecs: number | undefined;
        maxUsageCount: number | undefined;
    };
};
