import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";
import fs from "fs";
import dts from "vite-plugin-dts";
import eslintPlugin from "vite-plugin-eslint";

const ioPackage = fs.readFileSync("./package.json", "utf-8");

// https://vitejs.dev/config/
// https://vitejs-kr.github.io/guide/build.html#multi-page-app
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      skipDiagnostics: true,
      entryRoot: resolve(__dirname, "src/lib/"),
      libFolderPath: resolve(__dirname, "src/lib/"),
    }),
    stripDevFiles(),
    eslintPlugin(),
  ],
  root: __dirname,
  resolve: {
    // In production site build, we want to import naive-ui from node_modules
    alias:
      process.env.NODE_ENV !== "production"
        ? [
            {
              find: "@io-boxies/vue-lib",
              replacement: resolve(__dirname, "./src"),
            },
          ]
        : undefined,
  },
  // https://vitejs.dev/config/dep-optimization-options.html#optimizedeps-entries
  define: {
    "process.env.NODE_ENV": `'${process.env.NODE_ENV}'`,
    __DEV__: process.env.NODE_ENV !== "production",
    __VUE_LIB_VERSION__: JSON.stringify(JSON.parse(ioPackage).version),
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "IoBoxVue",
      // 적절한 확장자가 추가됩니다.
      fileName: "io-boxies-vue-lib",
      // https://beomy.github.io/tech/javascript/cjs-amd-umd-esm/
      formats: ["umd", "es"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library (sync peerDependencies)
      // eslint-disable-next-line no-sparse-arrays
      external: ["vue", , "axios"] as string[],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
          axios: "Axios",
        },
        // not support in lib mode
        // manualChunks(id) {
        //   if (id.includes("@io-boxies/js-lib")) {
        //     return "@io-boxies/js-lib";
        //   } else if (id.includes("lodash")) {
        //     return "lodash";
        //   } else if (id.includes("axios")) {
        //     return "axios";
        //   } else if (id.includes("date-fns")) {
        //     return "date-fns";
        //   } else if (id.includes("naive-ui")) {
        //     return "naive-ui";
        //   } else if (id.includes("firebase/messaging")) {
        //     return "firebase/messaging";
        //   } else if (id.includes("firebase/firestore")) {
        //     return "firebase/firestore";
        //   } else if (id.includes("firebase/storage")) {
        //     return "firebase/storage";
        //   } else if (id.includes("firebase/analytics")) {
        //     return "firebase/analytics";
        //   } else if (id.includes("node_modules")) {
        //     return "node_modules";
        //   }
        // },
      },
    },
  },
});

function stripDevFiles() {
  return {
    name: "strip-dev-files",
    resolveId(source) {
      return source === "virtual-module" ? source : null;
    },
    renderStart(outputOptions, inputOptions) {
      const outDir = outputOptions.dir;
      const cssDir = resolve(outDir, "dev-imgs");
      fs.rmdir(cssDir, { recursive: true }, () =>
        console.log(`Deleted ${cssDir}`)
      );
    },
  };
}
