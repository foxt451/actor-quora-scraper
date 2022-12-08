export const unixToDateIso = (timestamp: number, divider = 1000): string => {
    return new Date(timestamp / divider).toISOString();
};
