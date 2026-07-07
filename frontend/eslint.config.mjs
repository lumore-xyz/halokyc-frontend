import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Lock the base-ui headless primitives to src/components/ui/.
    // Anywhere else, import the shadcn wrappers, not the raw primitives.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@base-ui/react",
              message:
                "Import from @base-ui/react is restricted to src/components/ui/. Use the shadcn/ui wrapper in src/components/ui/ instead.",
            },
            {
              name: "@base-ui/react/button",
              message:
                "Import base-ui submodules from src/components/ui/ only. Wrap the primitive in a shadcn/ui component there.",
            },
          ],
          patterns: ["@base-ui/react/*"],
        },
      ],
    },
  },
]);

export default eslintConfig;