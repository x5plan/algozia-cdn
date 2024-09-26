import terser from "@rollup/plugin-terser";
import modules from "./configs/modules.mjs";
import bundles from "./configs/bundles.mjs";

const buildSrc = "build/";
const bundleDist = "dist/bundle/";
const moduelSrc = "node_modules/";
const moduleDist = "dist/modules/";

export default [
    ...bundles.map(({ src, dist }) => makeConfig(`${buildSrc}${src}`, `${bundleDist}${dist}`)),
    ...modules.map(({ src, dist }) => makeConfig(`${moduelSrc}${src}`, `${moduleDist}${dist}`)),
];

function makeConfig(input, output) {
    return {
        input: input,
        output: {
            file: output,
            format: "cjs",
            plugins: [terser()],
        },
    };
}
