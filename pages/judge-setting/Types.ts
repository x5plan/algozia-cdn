import type React from "react";
import { IJudgeInfoProcessor } from "./JudgeInfoProcessors/Types";
import { IEditorComponentProps } from "./Editors/Types";

export type IOptions<TEditorComponentType> =
    TEditorComponentType extends React.FunctionComponent<{ options?: infer T }> ? T : never;

export type IProblemTypeEditorComponent = React.FC<IEditorComponentProps<unknown>> & IJudgeInfoProcessor<unknown>;
