export interface EditorComponentProps<JudgeInfo, Options = never> {
    options?: Options;
    judgeInfo: JudgeInfo;
    pending: boolean;
    testData: string[];
    onUpdateJudgeInfo: (
        deltaOrReducer: Partial<JudgeInfo> | ((judgeInfo: JudgeInfo) => Partial<JudgeInfo>),
        isNotByUser?: boolean,
    ) => void;
}

export interface JudgeInfoProcessor<JudgeInfo, Options = never> {
    parseJudgeInfo(rawJudgeInfo: any, testData: string[], options?: Options): Partial<JudgeInfo>;
    normalizeJudgeInfo(judgeInfo: JudgeInfo, options?: Options): void;
}

export type Options<EditorComponentType> = EditorComponentType extends React.FC<{ options?: infer T }> ? T : never;

export type ProblemTypeEditorComponent = React.FC<EditorComponentProps<unknown>> & JudgeInfoProcessor<unknown>;
