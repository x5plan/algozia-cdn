import { useState } from "preact/hooks";
import React from "react";
import { Grid } from "semantic-ui-react";

import { E_ProblemType } from "../shared/Enums";
import { JudgeInfoEditor } from "./Components/JudgeSettingEditor";
import { ProblemTypeEditor } from "./Components/ProblemTypeEditor";

export const App: React.FC = () => {
    const [judgeInfo, setJudgeInfo] = useState<any>({});
    const [problemType, setProblemType] = useState<E_ProblemType>(E_ProblemType.Traditional);

    const onTypeChange = (type: E_ProblemType) => {
        setProblemType(type);
        setJudgeInfo({});
    };

    return (
        <Grid.Column width={9}>
            <ProblemTypeEditor
                type={problemType}
                pending={false}
                hasSubmission={false}
                onTypeChange={(type) => {
                    onTypeChange(type);
                }}
            />
            <JudgeInfoEditor problemType={problemType} judgeInfo={judgeInfo} testData={[]} pending={false} />
        </Grid.Column>
    );
};
