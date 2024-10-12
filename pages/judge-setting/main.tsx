import "vite/modulepreload-polyfill";
import "../shared/style.less";

import { render } from "preact";
import type React from "react";

import { App } from "./App";

render(<App />, document.getElementById("app-root")!);
