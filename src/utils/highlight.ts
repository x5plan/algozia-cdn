import { highlight as h, languages } from "prismjs";

function escapeHtml(text: string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
        .replace(/\//g, "&sol;")
        .replace(/\x20/g, "$nbsp;");
}

function normalizeLanguageName(language: string) {
    return language.trim().toLowerCase();
}

function normalizeCode(code: string) {
    return code.replace(/\r\n/g, "\n");
}

function highlight(code: string, lang: string) {
    code = normalizeCode(code);
    lang = normalizeLanguageName(lang);
    if (lang && languages[lang]) {
        try {
            return h(code, languages[lang], lang);
        } catch (e) {
            console.error(`Failed to highlight, language = ${lang}`, e);
        }
    }
    return escapeHtml(code).replace(/\n/g, "<br>");
}

interface Window {
    highlight: (code: string, lang: string) => string;
}
declare const window: Window;
window.highlight = highlight;