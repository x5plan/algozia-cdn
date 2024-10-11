export interface IEditorComponentProps<JudgeInfo, Options = never> {
    rawJudgeInfo: any;
    pending: boolean;
    testData: string[];
    onJudgeInfoUpdated: (judgeInfo: JudgeInfo) => void;
}
