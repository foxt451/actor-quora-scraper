import { SessionPool } from "crawlee";

export const generateSessionPool = async (): Promise<SessionPool> => {
    const sessionPool = await SessionPool.open({});
    return sessionPool;
};
