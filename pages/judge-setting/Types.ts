import type { E_ProblemType } from "../shared/Enums";

interface IChangeTypeMessageData {
    type: "ChangeType";
    problemType: E_ProblemType;
}

interface IInitializeMessageData {
    type: "Initialize";
    problemType: E_ProblemType;
    judgeInfo: any;
    testData: string[];
}

interface ISubmitJudgeInfoMessageData {
    type: "SubmitJudgeInfo";
}

interface IUpdateJudgeInfoMessageData {
    type: "UpdateJudgeInfo";
    judgeInfo: any;
}

export type IJudgeSettingEditorMessageData =
    | IChangeTypeMessageData
    | IInitializeMessageData
    | ISubmitJudgeInfoMessageData
    | IUpdateJudgeInfoMessageData;
