import { render } from "preact";
import { App } from "./app";
import jQuery from "jquery";

(window as any).$ = jQuery;

const root = document.getElementById("app");
if (root) {
    render(<App />, root);
}
