export function loadTraditionalProblemEditor() {
    return import("./TraditionalProblemEditor").then(({ TraditionalProblemEditor }) => ({
        default: TraditionalProblemEditor,
    }));
}

export function loadSubmitAnswerProblemEditor() {
    return import("./SubmitAnswerProblemEditor").then(({ SubmitAnswerProblemEditor }) => ({
        default: SubmitAnswerProblemEditor,
    }));
}

export function loadInteractionProblemEditor() {
    return import("./InteractionProblemEditor").then(({ InteractionProblemEditor }) => ({
        default: InteractionProblemEditor,
    }));
}
