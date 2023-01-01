export interface ConfigurationMap {
    formatUTC: string;
    formatLocale: string;
    copyFormatUTC: string;
    copyFormatLocale: string;
}

export const TodoImportanceList = ["Low", "Medium", "High"];
export enum TodoImportance {
    Low = 0,
    Medium = 1,
    High = 2,
}
