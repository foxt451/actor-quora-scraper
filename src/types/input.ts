import { ProxyConfigurationOptions } from "apify";

export type Input = {
    query: string;
    proxy: ProxyConfigurationOptions & {
        useApifyProxy?: boolean | undefined;
    };
};
