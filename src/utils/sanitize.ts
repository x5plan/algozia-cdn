import DOMPurify from "dompurify";

function sanitize(html: string): string {
    const result = DOMPurify.sanitize(html, {
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
    });

    return result;
}

interface Window {
    sanitize: (html: string) => string;
}
declare const window: Window;
window.sanitize = sanitize;