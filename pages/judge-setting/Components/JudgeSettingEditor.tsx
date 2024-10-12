import { useMemo } from "preact/hooks";
import type React from "react";

import { E_ProblemType } from "../../shared/Enums";
import { InteractionProblemEditor } from "./InteractionProblemEditor";
import { SubmitAnswerProblemEditor } from "./SubmitAnswerProblemEditor";
import { TraditionalProblemEditor } from "./TraditionalProblemEditor";

export interface IJudgeInfoEditorProps {
    problemType: E_ProblemType;
    testData: string[];
    judgeInfo: any;
    pending: boolean;
}

export const JudgeInfoEditor: React.FunctionComponent<IJudgeInfoEditorProps> = (props) => {
    const { problemType, testData, judgeInfo, pending } = props;

    const JudgeInfoEditorComponent = useMemo(() => {
        switch (problemType) {
            case E_ProblemType.Traditional:
                return TraditionalProblemEditor;
            case E_ProblemType.SubmitAnswer:
                return SubmitAnswerProblemEditor;
            case E_ProblemType.Interaction:
                return InteractionProblemEditor;
        }
    }, [problemType]);

    return (
        <JudgeInfoEditorComponent
            judgeInfo={judgeInfo}
            testData={testData}
            pending={pending}
            onUpdateJudgeInfo={() => {}}
        />
    );
};
