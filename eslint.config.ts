import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import type { Linter } from "eslint";
import localRules from "./eslint-local-rules.ts";

const namingOptions = [
  {
    selector: "interface",
    format: ["PascalCase"],
    custom: { regex: "^I[A-Z]", match: true },
  },
  {
    selector: "enum",
    format: ["PascalCase"],
    custom: { regex: "^E[A-Z]", match: true },
  },
  {
    selector: ["variable", "parameter", "property"],
    types: ["boolean"],
    format: ["PascalCase"],
    prefix: [
      "is",
      "has",
      "can",
      "should",
      "will",
      "did",
      "was",
      "are",
      "does",
      "needs",
    ],
    filter: { regex: "^[A-Z][A-Z0-9_]*$", match: false },
  },
];

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    extends: [js.configs.recommended],
    plugins: { local: localRules, react },
    languageOptions: {
      globals: globals.node,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "no-console": "error",
      "local/todo-comments-only": "error",
      "local/import-order": "error",
      "local/type-files-only": "error",
      "local/constant-names": "error",
      "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { react, "jsx-a11y": jsxA11y, local: localRules },
    settings: { react: { version: "detect" } },
    rules: {
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/naming-convention": ["error", ...namingOptions],
      "no-console": "error",
      "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
      "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
      "react/jsx-curly-spacing": ["error", { when: "never", children: true }],
      "react/jsx-tag-spacing": [
        "error",
        {
          closingSlash: "never",
          beforeSelfClosing: "always",
          afterOpening: "never",
          beforeClosing: "never",
        },
      ],
      "react/jsx-equals-spacing": ["error", "never"],
      "react/jsx-props-no-multi-spaces": "error",
      "local/todo-comments-only": "error",
      "local/type-files-only": "error",
      "local/constant-names": "error",
      "local/import-order": "error",
      "local/component-props": "error",
      eqeqeq: ["error", "always"],
      "react/jsx-key": "error",
      "react/no-array-index-key": "warn",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/control-has-associated-label": "error",
      "jsx-a11y/click-events-have-key-events": "error",
    },
  },
  ...[
    { files: ["src/processes/**/*.{ts,tsx}"], forbidden: ["app"] },
    { files: ["src/pages/**/*.{ts,tsx}"], forbidden: ["app", "processes"] },
    {
      files: ["src/features/**/*.{ts,tsx}"],
      forbidden: ["app", "processes", "pages"],
    },
    {
      files: ["src/entities/**/*.{ts,tsx}"],
      forbidden: ["app", "processes", "pages", "features"],
    },
    {
      files: ["src/shared/**/*.{ts,tsx}"],
      forbidden: ["app", "processes", "pages", "features", "entities"],
    },
  ].map(
    ({ files, forbidden }): Linter.Config => ({
      files,
      rules: {
        "no-restricted-imports": [
          "error" as const,
          {
            patterns: [
              {
                regex: `^(?:(?:\\.\\.?/)+|@/|~/|src/|/src/)?(?:${forbidden.join("|")})(?:/|$)`,
                message:
                  "FSD layers may only import lower layers: app -> processes -> pages -> features -> entities -> shared.",
              },
            ],
          },
        ],
      },
    }),
  ),
  {
    files: ["vite.config.ts", "eslint*.ts", "scripts/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["eslint.config.ts", "eslint-local-rules.test.ts"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "objectLiteralProperty",
          filter: {
            regex:
              "^(jsx|projectService|match|allowSeparateTypeImports|children)$",
            match: true,
          },
          format: null,
        },
        ...namingOptions,
      ],
    },
  },
]);
