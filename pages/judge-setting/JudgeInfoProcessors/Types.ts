export interface IJudgeInfoProcessor<JudgeInfo, Options = never> {
    parseJudgeInfo(rawJudgeInfo: any, testData: string[], options?: Options): Partial<JudgeInfo>;
    normalizeJudgeInfo(judgeInfo: JudgeInfo, options?: Options): void;
}
