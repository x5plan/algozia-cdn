interface Window {
    markdownit: typeof import("markdown-it");
    markdownitMath: any;
    renderSanitizedMarkdown: (content: string, element?: HTMLElement) => string;
}

namespace MarkdownUtil {
    const DOMPurifyConfig = {
        ALLOWED_TAGS: [
            "a",
            "b",
            "i",
            "u",
            "em",
            "strong",
            "small",
            "mark",
            "abbr",
            "code",
            "pre",
            "blockquote",
            "ol",
            "ul",
            "li",
            "br",
            "p",
            "hr",
            "div",
            "span",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
            "caption",
            "img",
        ],
        ALLOWED_ATTR: ["href", "title", "alt", "src", "width", "height", "target", "md-data-id"],
    };

    export interface IHighlightPlaceholder {
        readonly id: string;
        readonly code: string;
        readonly lang: string;
    }

    export interface IMathPlaceholder {
        readonly id: string;
        readonly math: string;
        readonly display: boolean;
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
        return wrapperElement.querySelector(`span[md-data-id="${id}"]`) as HTMLSpanElement;
    }

    function randomUUID() {
        if (window.crypto.randomUUID && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }

        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => {
            const c = Number(r);
            return (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16);
        });
    }

    function checkDependencies() {
        let result = true;
        if (!window.markdownit) {
            console.error("MarkdownIt is not loaded.");
            result = false;
        }

        if (!window.DOMPurify) {
            console.error("DOMPurify is not loaded.");
            result = false;
        }

        if (!window.Prism) {
            console.error("highlightCode is not loaded.");
            result = false;
        }

        if (!window.katex) {
            console.error("KaTeX is not loaded.");
            result = false;
        }

        if (!window.markdownitMath) {
            console.error("markdownit-math is not loaded.");
            result = false;
        }

        return result;
    }

    function highlightCode(code: string, lang: string) {
        code = code.replace(/\r\n/g, "\n");
        lang = lang.trim().toLowerCase();
        if (lang && window.Prism.languages[lang]) {
            try {
                return window.Prism.highlight(code, window.Prism.languages[lang], lang);
            } catch (e) {
                console.error(`Failed to highlight, language = ${lang}`, e);
            }
        } else {
            console.warn(`Language not supported: ${lang}`);
        }

        return window.DOMPurify.sanitize(code, DOMPurifyConfig)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;")
            .replace(/\//g, "&sol;")
            .replace(/\x20/g, "&nbsp;")
            .replace(/\n/g, "<br>");
    }

    function renderMarkdown(content: string): IRenderedMarkdown {
        const highlightPlaceholders: IHighlightPlaceholder[] = [];
        const mathPlaceholders: IMathPlaceholder[] = [];

        const renderer = window.markdownit({
            html: true,
            breaks: false,
            linkify: true,
            typographer: true,
            highlight: (code, lang) => {
                const id = randomUUID();
                highlightPlaceholders.push({
                    id,
                    code,
                    lang,
                });

                return `<pre><code>${generatePlaceholder(id)}</code></pre>`;
            },
        });

        renderer.use(window.markdownitMath, {
            inlineOpen: "$",
            inlineClose: "$",
            blockOpen: "$$",
            blockClose: "$$",
            inlineRenderer: (math: string) => {
                const id = randomUUID();
                mathPlaceholders.push({
                    id,
                    math,
                    display: false,
                });

                return generatePlaceholder(id);
            },
            blockRenderer: (math: string) => {
                const id = randomUUID();
                mathPlaceholders.push({
                    id,
                    math,
                    display: true,
                });

                return generatePlaceholder(id);
            },
        });

        return {
            html: renderer.render(content),
            highlightPlaceholders,
            mathPlaceholders,
        };
    }

    window.renderSanitizedMarkdown = function (content, element) {
        const target = element ?? document.createElement("div");

        if (!checkDependencies()) {
            return "";
        }

        const { html, highlightPlaceholders, mathPlaceholders } = renderMarkdown(content);

        target.innerHTML = window.DOMPurify.sanitize(html, DOMPurifyConfig);
        target.classList.add("markdown-content");

        highlightPlaceholders.forEach(({ id, code, lang }) => {
            const element = getPlaceholderElement(target, id);
            element.outerHTML = highlightCode(code, lang);
        });

        mathPlaceholders.forEach(({ id, math, display }) => {
            const element = getPlaceholderElement(target, id);
            window.katex.render(math, element, {
                displayMode: display,
                throwOnError: false,
            });
        });

        return target.outerHTML;
    };
}
