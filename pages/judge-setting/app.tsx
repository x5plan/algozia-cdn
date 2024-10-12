import { useState } from "preact/hooks";
import React from "react";
import { Grid } from "semantic-ui-react";

import type { E_ProblemType } from "../shared/Enums";
import { CodeBox } from "./Components/CodeBox";
import { JudgeInfoEditor } from "./Components/JudgeSettingEditor";
import { ProblemTypeEditor } from "./Components/ProblemTypeEditor";
import { getSharedObject } from "./Utils";

export const App: React.FC = () => {
    const { data, onUpdateType, onUpdateJudgeInfo } = getSharedObject();

    const [judgeInfoRaw, setJudgeInfoRaw] = useState<any>(data.judgeInfo);
    const [normalizeJudgeInfo, setNormalizeJudgeInfo] = useState<any>(data.judgeInfo);
    const [problemType, setProblemType] = useState<E_ProblemType>(data.type as E_ProblemType);

    return (
        <Grid.Row>
            <Grid.Column width={7}>
                <CodeBox judgeInfo={normalizeJudgeInfo} />
            </Grid.Column>
            <Grid.Column width={9}>
                <ProblemTypeEditor
                    type={problemType}
                    hasSubmission={data.hasSubmissions}
                    onTypeChange={(type) => {
                        setProblemType(type);
                        onUpdateType(type);
                    }}
                />
                <JudgeInfoEditor
                    problemType={problemType}
                    judgeInfoRaw={judgeInfoRaw}
                    testData={data.testDataFileNames}
                    onUpdateJudgeInfoRaw={(judgeInfoRaw) => {
                        setJudgeInfoRaw(judgeInfoRaw);
                    }}
                    onUpdateNomalizedJudgeInfo={(judgeInfo) => {
                        setNormalizeJudgeInfo(judgeInfo);
                        onUpdateJudgeInfo(judgeInfo);
                    }}
                />
            </Grid.Column>
        </Grid.Row>
    );
};
