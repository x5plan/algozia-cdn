export interface IEditorComponentProps<JudgeInfo, Options = never> {
    options?: Options;
    judgeInfo: JudgeInfo;
    pending: boolean;
    testData: string[];
    onUpdateJudgeInfo: (
        deltaOrReducer: Partial<JudgeInfo> | ((judgeInfo: JudgeInfo) => Partial<JudgeInfo>),
        isNotByUser?: boolean,
    ) => void;
}
