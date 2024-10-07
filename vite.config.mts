import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import pages from "./configs/pages.json";

const pagesConfig = Object.fromEntries(pages.map((page) => [page, `/${page}.html`]));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [preact()],
    root: "./pages",
    base: "/pages",
    server: {
        port: 5173,
        cors: true,
        strictPort: true,
    },
    build: {
        outDir: "../dist/pages",
        emptyOutDir: true,
        rollupOptions: {
            input: pagesConfig,
            output: {
                entryFileNames: "assets/[name].[hash].js",
                chunkFileNames: "assets/[name].[hash].js",
                assetFileNames: "assets/[name].[hash][extname]",
            },
        },
    },
});
