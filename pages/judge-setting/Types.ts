import type React from "react";

import type { CE_ProblemType } from "../shared/Enums";
import type { IEditorComponentProps } from "./Editors/Types";
import type { IJudgeInfoProcessor } from "./JudgeInfoProcessors/Types";

export type IOptions<TEditorComponentType> =
    TEditorComponentType extends React.FunctionComponent<{ options?: infer T }> ? T : never;

export type IProblemTypeEditorComponent = React.FC<IEditorComponentProps<unknown>> & IJudgeInfoProcessor<unknown>;

interface IChangeTypeMessageData {
    type: "ChangeType";
    problemType: CE_ProblemType;
}

interface IInitializeMessageData {
    type: "Initialize";
    problemType: CE_ProblemType;
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
