import assert from "node:assert/strict";

import { ESLint, Linter, RuleTester } from "eslint";
import tseslint from "typescript-eslint";

import local from "./eslint-local-rules.ts";

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});
const error = { messageId: "invalid" };

tester.run("todo-comments-only", local.rules["todo-comments-only"], {
  valid: [
    "// TODO:: Add reconnect tests\nconst value = 1",
    "/* TODO:: Implement alerts */",
    'const url = "https://example.com"',
  ],
  invalid: [
    { code: "// random explanation", errors: [error] },
    { code: "// TODO: later", errors: [error] },
    { code: "// TODO::", errors: [error] },
  ],
});
tester.run("type-files-only", local.rules["type-files-only"], {
  valid: [
    {
      filename: "/src/Button/types/index.ts",
      code: 'import type { ReactNode } from "react"; export interface IButtonProps { children: ReactNode }',
    },
    {
      filename: "/src/types.ts",
      code: 'export type TStatus = "loading" | "ready"',
    },
    {
      filename: "/src/types/index.ts",
      code: 'export type { IButtonProps } from "./button"',
    },
  ],
  invalid: [
    {
      filename: "/src/types.ts",
      code: "export const value = 1",
      errors: [error],
    },
    {
      filename: "/src/types/index.ts",
      code: 'import "./side-effect"',
      errors: [error],
    },
    {
      filename: "/src/types/index.ts",
      code: "export enum EStatus { Ready }",
      errors: [error],
    },
    {
      filename: "/src/types.tsx",
      code: "export interface IProps {}",
      errors: [error],
    },
  ],
});
tester.run("constant-names", local.rules["constant-names"], {
  valid: [
    { filename: "/src/constants.ts", code: "export const MAX_RETRIES = 5" },
    { filename: "/src/constants/market.ts", code: "const IS_ENABLED = true" },
    { filename: "/src/app/App.tsx", code: "const value = 1" },
  ],
  invalid: [
    {
      filename: "/src/constants.ts",
      code: "export const maxRetries = 5",
      errors: [error],
    },
    {
      filename: "/src/constants/market.ts",
      code: "let MAX_RETRIES = 5",
      errors: [error],
    },
    {
      filename: "/src/constants.ts",
      code: "const { maxRetries } = config",
      errors: [error],
    },
  ],
});
tester.run("import-order", local.rules["import-order"], {
  valid: [
    'import path from "node:path"; import React from "react"; import type { IProps } from "./types"; import "./styles.css";',
  ],
  invalid: [
    {
      code: 'import "./styles.css"; import App from "./App";',
      errors: [error],
    },
    {
      code: 'import App from "@/App"; import React from "react";',
      errors: [error],
    },
    {
      code: 'import React from "react"; import path from "path";',
      errors: [error],
    },
  ],
});
tester.run("component-props", local.rules["component-props"], {
  valid: [
    {
      filename: "/src/Button/Button.tsx",
      code: 'import type { IButtonProps } from "./types"; function Button(props: IButtonProps) { return <button>{props.label}</button> }',
    },
    {
      filename: "/src/Button/Button.tsx",
      code: 'import type { IButtonProps } from "./types/button"; const Button = memo(({ label }: IButtonProps) => <button>{label}</button>)',
    },
    {
      filename: "/src/Button/types/index.ts",
      code: "export interface IButtonProps { label: string }",
    },
    { filename: "/src/app/App.tsx", code: "function App() { return <div/> }" },
  ],
  invalid: [
    {
      filename: "/src/Button/Button.tsx",
      code: "function Button(props: { label: string }) { return <button/> }",
      errors: [error],
    },
    {
      filename: "/src/Button/Button.tsx",
      code: "interface IButtonProps { label: string }; function Button(props: IButtonProps) { return <button/> }",
      errors: [error, error],
    },
    {
      filename: "/src/Button/Button.tsx",
      code: 'import type { IButtonProps } from "../Other/types"; const Button = (props: IButtonProps) => <button/>',
      errors: [error],
    },
    {
      filename: "/src/Button/Button.tsx",
      code: 'function Button(props: IButtonProps) { return <button/> }; import type { IButtonProps } from "./types";',
      errors: [error],
    },
  ],
});

const lint = new ESLint();
const appConfig = (await lint.calculateConfigForFile("src/app/App.tsx")) as {
  rules: Record<string, [0 | 1 | 2, ...unknown[]]>;
};
for (const name of [
  "no-console",
  "local/component-props",
  "local/import-order",
  "@typescript-eslint/naming-convention",
])
  assert.equal(appConfig.rules[name][0], 2);
const results = await lint.lintText(
  "interface BadName {}\nenum Status { Ready }\nconst active = true;\nconsole.log(active);\nexport { BadName, Status };",
  { filePath: "src/app/App.tsx" },
);
assert.ok(
  results[0].messages.some((message) => message.ruleId === "no-console"),
);
assert.ok(
  results[0].messages.filter(
    (message) => message.ruleId === "@typescript-eslint/naming-convention",
  ).length >= 3,
);
for (const [code, expectedRule, filePath] of [
  [
    'import { useState } from "react"; export const value = 1;',
    "@typescript-eslint/no-unused-vars",
    "src/app/App.tsx",
  ],
  [
    'export default function App() { return <div title = "value" /> }',
    "react/jsx-equals-spacing",
    "src/app/App.tsx",
  ],
  [
    "export default function App() { return <div /> }",
    "react/jsx-filename-extension",
    "src/Example.jsx",
  ],
]) {
  const [result] = await lint.lintText(code, { filePath });
  assert.ok(
    result.messages.some((message) => message.ruleId === expectedRule),
    expectedRule,
  );
}
const boundaryLint = new Linter();
for (const [layer, forbidden, allowed] of [
  ["processes", "app", "pages"],
  ["pages", "processes", "features"],
  ["features", "pages", "entities"],
  ["entities", "features", "shared"],
  ["shared", "entities", null],
]) {
  const config = (await lint.calculateConfigForFile(
    `src/${layer}/example/index.ts`,
  )) as { rules: Record<string, [0 | 1 | 2, ...unknown[]]> };
  const rules = {
    "no-restricted-imports": config.rules["no-restricted-imports"],
  };
  for (const prefix of ["@/", "../../", "src/"]) {
    const messages = boundaryLint.verify(
      `import { value } from '${prefix}${forbidden}/example';`,
      { rules },
    );
    assert.ok(
      messages.some((message) => message.ruleId === "no-restricted-imports"),
      `${layer} must not import ${forbidden}`,
    );
  }
  if (allowed) {
    const messages = boundaryLint.verify(
      `import { value } from '../../${allowed}/example';`,
      { rules },
    );
    assert.equal(messages.length, 0, `${layer} can import ${allowed}`);
  }
}
process.stdout.write(
  "Custom ESLint rule tests, typed naming, and layer boundary checks passed.\n",
);
