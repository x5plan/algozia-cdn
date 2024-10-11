export function loadTraditionalProblemEditor() {
    return import("./TraditionalProblemEditor").then(({ TraditionalProblemEditor }) => ({
        default: TraditionalProblemEditor,
    }));
}
