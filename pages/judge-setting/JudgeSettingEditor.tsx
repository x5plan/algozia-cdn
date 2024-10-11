import { lazy, Suspense } from "preact/compat";
import { useCallback, useMemo, useState } from "preact/hooks";
import type React from "react";

import { CE_ProblemType } from "../shared/Enums";
import {
    loadInteractionProblemEditor,
    loadSubmitAnswerProblemEditor,
    loadTraditionalProblemEditor,
} from "./Editors/LazyLoad";

const TraditionalProblemEditorLazy = lazy(loadTraditionalProblemEditor);
const SubmitAnswerProblemEditorLazy = lazy(loadSubmitAnswerProblemEditor);
const InteractionProblemEditorLazy = lazy(loadInteractionProblemEditor);

export interface IProblemJudgeSettingsPageProps {
    problemType: CE_ProblemType;
    testData: string[];
    rawJudgeInfo: any;

    onJudgeInfoChange: (judgeInfo: any, judgeInfoYaml: string) => void;
}

export const JudgeSettingsEditor: React.FunctionComponent<IProblemJudgeSettingsPageProps> = (props) => {
    const { problemType, testData, rawJudgeInfo, onJudgeInfoChange } = props;
    const [pending] = useState(false);

    const ProblemTypeEditorComponentLazy = useMemo(() => {
        switch (problemType) {
            case CE_ProblemType.Traditional:
                return TraditionalProblemEditorLazy;
            case CE_ProblemType.SubmitAnswer:
                return SubmitAnswerProblemEditorLazy;
            case CE_ProblemType.Interaction:
                return InteractionProblemEditorLazy;

            default:
                return null;
        }
    }, [problemType]);

    const onJudgeInfoUpdated = useCallback(
        (judgeInfo: any) => {
            onJudgeInfoChange(judgeInfo, "");
        },
        [onJudgeInfoChange],
    );

    return (
        ProblemTypeEditorComponentLazy && (
            <Suspense fallback={null}>
                <ProblemTypeEditorComponentLazy
                    testData={testData}
                    rawJudgeInfo={rawJudgeInfo}
                    pending={pending}
                    onJudgeInfoUpdated={onJudgeInfoUpdated}
                />
            </Suspense>
        )
    );
};
