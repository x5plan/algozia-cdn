import type * as React from "preact";

export interface IEditorComponentProps<JudgeInfo, Options = never> {
    options?: Options;
    rawJudgeInfo: any;
    pending: boolean;
    testData: string[];
    onUpdateJudgeInfo: (
        deltaOrReducer: Partial<JudgeInfo> | ((judgeInfo: JudgeInfo) => Partial<JudgeInfo>),
        isNotByUser?: boolean,
    ) => void;
}

export interface IJudgeInfoProcessor<JudgeInfo, Options = never> {
    parseJudgeInfo(rawJudgeInfo: any, testData: string[], options?: Options): Partial<JudgeInfo>;
    normalizeJudgeInfo(judgeInfo: JudgeInfo, options?: Options): void;
}

export type IOptions<TEditorComponentType> =
    TEditorComponentType extends React.FunctionComponent<{ options?: infer T }> ? T : never;

export type IProblemTypeEditorComponent = React.FunctionComponent<IEditorComponentProps<unknown>> &
    IJudgeInfoProcessor<unknown>;
