import MarkdownIt from "markdown-it";
// @ts-ignore
import MarkdownItMath from "markdown-it-math-loose";
// @ts-ignore
import MarkdownItMergeCells from "markdown-it-merge-cells/src";
import { v4 as uuidv4 } from "uuid";

import "./sanitize";
import "./highlight";
import "./math";

export interface IHighlightPlaceholder {
    id: string;
    code: string;
    lang: string;
}

export interface IMathPlaceholder {
    id: string;
    math: string;
    display: boolean;
}

export interface IRenderedMarkdown {
    readonly html: string;
    readonly highlightPlaceholders: IHighlightPlaceholder[];
    readonly mathPlaceholders: IMathPlaceholder[];
}

// Use a <span> placeholder for highlights and maths
// They're replaced after HTML sanitation
function generatePlaceholder(id: string) {
    return `<span md-data-id="${id}"></span>`;
}

function getPlaceholderElement(wrapperElement: HTMLElement, id: string): HTMLSpanElement {
    return document.querySelector(`span[md-data-id="${id}"]`) as HTMLSpanElement;
}

function renderMarkdown(content: string, onPatchRenderer?: (renderer: MarkdownIt) => void): IRenderedMarkdown {
    const highlightPlaceholders: IHighlightPlaceholder[] = [];
    const mathPlaceholders: IMathPlaceholder[] = [];

    const renderer = new MarkdownIt({
        html: true,
        breaks: false,
        linkify: true,
        typographer: true,
        highlight: (code, lang) => {
            const id = uuidv4();
            highlightPlaceholders.push({
                id,
                code,
                lang,
            });

            return `<pre><code>${generatePlaceholder(id)}</code></pre>`;
        },
    });

    renderer.use(MarkdownItMath, {
        inlineOpen: "$",
        inlineClose: "$",
        blockOpen: "$$",
        blockClose: "$$",
        inlineRenderer: (math: string) => {
            const id = uuidv4();
            mathPlaceholders.push({
                id,
                math,
                display: false,
            });

            return generatePlaceholder(id);
        },
        blockRenderer: (math: string) => {
            const id = uuidv4();
            mathPlaceholders.push({
                id,
                math,
                display: true,
            });

            return generatePlaceholder(id);
        },
    });

    renderer.use(MarkdownItMergeCells);

    onPatchRenderer?.(renderer);

    return {
        html: renderer.render(content),
        highlightPlaceholders,
        mathPlaceholders,
    };
}

interface Window {
    renderMarkdownTo: (content: string, target: string) => void;
    highlight: (code: string, lang: string) => string;
    renderMath: (math: string, displayMode: boolean) => string;
    sanitize: (html: string) => string;
}
declare const window: Window;
window.renderMarkdownTo = function (content, target) {
    const targetEl = document.querySelector(target) as HTMLElement;
    if (!targetEl) return;

    const { html, highlightPlaceholders, mathPlaceholders } = renderMarkdown(content);

    targetEl.innerHTML = window.sanitize(html);
    targetEl.className = "markdown-content";

    highlightPlaceholders.forEach(({ id, code, lang }) => {
        const element = getPlaceholderElement(targetEl, id);
        if (!element) return;

        element.outerHTML = window.highlight(code, lang);
    });

    mathPlaceholders.forEach(({ id, math, display }) => {
        const element = getPlaceholderElement(targetEl, id);
        if (!element) return;

        element.outerHTML = window.renderMath(math, display);
    });
};
