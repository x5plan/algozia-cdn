import { ICheckerType, ICheckerConfig } from "./CheckerEditor.type";
import { E_CodeLanguage } from "../../../shared/Enums";
import {
    checkCodeFileExtension,
    filterValidCompileAndRunOptions,
    getDefaultCompileAndRunOptions,
} from "../../../shared/CodeLanguageUtils";

export const CHECKER_TYPES: ICheckerType[] = ["integers", "floats", "lines", "binary", "custom"];
export const CUSTOM_CHECKER_INTERFACES = ["testlib", "legacy", "lemon", "hustoj", "qduoj", "domjudge"];

export function parseCheckerConfig(checker: Partial<ICheckerConfig>, testData: string[]): ICheckerConfig {
    if (!checker || !CHECKER_TYPES.includes(checker.type))
        return {
            // default
            type: "lines",
            caseSensitive: false,
        };

    switch (checker.type) {
        case "integers":
            return { type: "integers" };
        case "floats":
            return {
                type: "floats",
                precision: Number.isSafeInteger(checker.precision) && checker.precision > 0 ? checker.precision : 4,
            };
        case "lines":
            return { type: "lines", caseSensitive: !!checker.caseSensitive };
        case "binary":
            return { type: "binary" };
        case "custom":
            const language = Object.values(E_CodeLanguage).includes(checker.language)
                ? checker.language
                : E_CodeLanguage.Cpp;
            return {
                type: "custom",
                interface: CUSTOM_CHECKER_INTERFACES.includes(checker.interface)
                    ? checker.interface
                    : CUSTOM_CHECKER_INTERFACES[0],
                language: language,
                compileAndRunOptions:
                    language === checker.language
                        ? filterValidCompileAndRunOptions(language, checker.compileAndRunOptions)
                        : getDefaultCompileAndRunOptions(language),
                filename:
                    checker.filename && typeof checker.filename === "string"
                        ? checker.filename
                        : testData.find((file) => checkCodeFileExtension(language, file)) || testData[0] || "",
                timeLimit: Number.isSafeInteger(checker.timeLimit) ? checker.timeLimit : null,
                memoryLimit: Number.isSafeInteger(checker.memoryLimit) ? checker.memoryLimit : null,
            };
    }
}
