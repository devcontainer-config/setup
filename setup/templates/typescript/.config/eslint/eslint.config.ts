import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import { gitignore } from "eslint-flat-config-gitignore";
import globals from "globals";
import tsESLint from "typescript-eslint";

export default tsESLint.config(
  await gitignore(import.meta.dirname),
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { globals: globals.node },
  },
  eslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,cts,mts}"],
    extends: [...tsESLint.configs.recommendedTypeChecked, ...tsESLint.configs.stylisticTypeChecked],
    languageOptions: { parserOptions: { project: true, tsConfigRootDir: import.meta.dirname } },
  },
  prettier,
);
