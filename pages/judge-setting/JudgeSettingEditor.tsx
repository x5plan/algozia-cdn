import React from "preact";
import { useMemo, useState } from "preact/hooks";
import { lazy, Suspense } from "preact/compat";

import { loadTraditionalProblemEditor } from "./Editors/LazyLoad";
import { CE_ProblemType } from "../shared/Enums";

const TraditionalProblemEditorLazy = lazy(loadTraditionalProblemEditor);

export interface IProblemJudgeSettingsPageProps {
    problemType: CE_ProblemType;
    testData: string[];
    rawJudgeInfo: any;

    onJudgeInfoChange: (judgeInfo: any, judgeInfoYaml: string) => void;
}

export const JudgeSettingsEditor: React.FunctionComponent<IProblemJudgeSettingsPageProps> = (props) => {
    const { problemType, testData, rawJudgeInfo } = props;
    const [pending, setPending] = useState(false);

    const ProblemTypeEditorComponentLazy = useMemo(() => {
        switch (problemType) {
            case CE_ProblemType.Traditional:
                return TraditionalProblemEditorLazy;
            case CE_ProblemType.SubmitAnswer:
            case CE_ProblemType.Interaction:

            default:
                return null;
        }
    }, [problemType]);

    return (
        ProblemTypeEditorComponentLazy && (
            <Suspense fallback={null}>
                <ProblemTypeEditorComponentLazy
                    testData={testData}
                    rawJudgeInfo={rawJudgeInfo}
                    pending={pending}
                    onJudgeInfoUpdated={() => {}}
                />
            </Suspense>
        )
    );
};
