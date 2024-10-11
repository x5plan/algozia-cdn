import type { E_CodeLanguage } from "../../../shared/Enums";

export interface IJudgeInfoWithExtraSourceFiles {
    // language => dst => src
    extraSourceFiles?: Partial<Record<E_CodeLanguage, Record<string, string>>>;
}
