import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // `dist` is the build output; `docs/examples` holds reference snippets
  // (Vercel serverless / meta-proxy examples) that aren't valid TS/JS in
  // this project's bundler config and shouldn't be linted.
  // `supabase/functions` runs in a Deno runtime with its own globals
  // (Deno.serve, Deno.env, etc.) — linting it under the browser config
  // produces noise, not real findings. Lint those separately if needed.
  { ignores: ["dist", "docs/examples/**", "supabase/functions/**"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Downgraded from `error` (the typescript-eslint/recommended default)
      // because the codebase has ~1,750 pre-existing `: any` annotations,
      // mostly around untyped Supabase rows and Recharts payloads. Keeping
      // them as warnings preserves the signal in editors and CI summaries
      // without drowning out real errors. New code should still avoid
      // explicit any; the TypeScript `noImplicitAny` flag (Phase G.3) keeps
      // *implicit* anys out, which is the more impactful guardrail.
      "@typescript-eslint/no-explicit-any": "warn",
      // The following are style rules that flag patterns the codebase uses
      // by convention. Demoted to warnings so the error count reflects real
      // bugs only; the warnings still surface in editors / CI summaries
      // for incremental cleanup.
      "no-case-declarations": "warn",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-useless-escape": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  }
);
