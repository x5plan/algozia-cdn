import type React from "react";

import type { IEditorComponentProps } from "./Editors/Types";
import type { IJudgeInfoProcessor } from "./JudgeInfoProcessors/Types";

export type IOptions<TEditorComponentType> =
    TEditorComponentType extends React.FunctionComponent<{ options?: infer T }> ? T : never;

export type IProblemTypeEditorComponent = React.FC<IEditorComponentProps<unknown>> & IJudgeInfoProcessor<unknown>;
