export interface IEditorComponentProps<JudgeInfo> {
    rawJudgeInfo: any;
    pending: boolean;
    testData: string[];
    onJudgeInfoUpdated: (judgeInfo: JudgeInfo) => void;
}
