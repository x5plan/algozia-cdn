import type React from "react";

import type { IJudgeInfoProcessor } from "../JudgeInfoProcessors/Types";

export interface IEditorComponentProps<JudgeInfo, Options = never> {
    options?: Options;
    judgeInfo: JudgeInfo;
    pending: boolean;
    testData: string[];
    onUpdateJudgeInfo: (deltaOrReducer: Partial<JudgeInfo> | ((judgeInfo: JudgeInfo) => Partial<JudgeInfo>)) => void;
}

export type IOptions<TEditorComponentType> = TEditorComponentType extends React.FC<{ options?: infer T }> ? T : never;
