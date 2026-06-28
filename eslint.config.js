import js from "@eslint/js";
import vitestPlugin from "@vitest/eslint-plugin";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jestDomPlugin from "eslint-plugin-jest-dom";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import markdownPlugin from "eslint-plugin-markdown";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import storybookPlugin from "eslint-plugin-storybook";
import testingLibraryPlugin from "eslint-plugin-testing-library";
import playwrightPlugin from 'eslint-plugin-playwright';
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      "build/",
      "public/build/",
      "public/mockServiceWorker.js",
      "playwright-report/",
      "test-results/",
      "**/__generated__/",
      ".react-router/",
    ],
  },

  js.configs.recommended,

  ...storybookPlugin.configs["flat/recommended"],

  // React (js, jsx, ts, tsx)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es2021,
      },
    },
    settings: {
      react: { version: "detect" },
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.flat.recommended.rules,
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      eqeqeq: ["error", "smart"],
      "no-console": "error",
      "no-eval": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-const": "error",
      "prefer-template": "error",
    },
  },

  // TypeScript (ts, tsx)
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/internal-regex": "^~/",
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      ...importPlugin.flatConfigs.typescript.rules,
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/only-throw-error": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "with-single-extends" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowAny: false,
          allowBoolean: true,
          allowNever: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],
      curly: ["error", "all"],
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-cycle": "error",
      "import/no-duplicates": "error",
      "import/no-mutable-exports": "error",
      "import/no-named-as-default": "error",
      "import/no-named-as-default-member": "error",
      "import/no-namespace": "error",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "import/order": [
        "error",
        {
          alphabetize: { caseInsensitive: true, order: "asc" },
          groups: ["builtin", "external", "internal", "parent", "sibling"],
          "newlines-between": "always",
        },
      ],
      "react/hook-use-state": "error",
      "react/jsx-curly-brace-presence": "error",
      "react/jsx-no-constructed-context-values": "error",
      "react/no-array-index-key": "error",
      "react/no-unstable-nested-components": "error",
      "react/self-closing-comp": "error",
    },
  },

  // Routes
  {
    files: ["app/routes/**/*.{ts,tsx}"],
    rules: {
      "jsx-a11y/no-autofocus": "off",
    },
  },

  // Markdown
  ...markdownPlugin.configs.recommended,

  // Tests (Vitest)
  {
    files: ["**/*.test.{js,jsx,ts,tsx}"],
    plugins: {
      vitest: vitestPlugin,
      "jest-dom": jestDomPlugin,
      "testing-library": testingLibraryPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      ...jestDomPlugin.configs["flat/recommended"].rules,
      ...testingLibraryPlugin.configs["flat/react"].rules,
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // Tests (Playwright)
  {
    files: ["tests/**/*.spec.ts", "tests/**/*.ts"],
    ...playwrightPlugin.configs["flat/recommended"],
  },

  // Node files (mocks)
  {
    files: ["mocks/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Server files and API routes — allow console
  {
    files: [
      "**/*.server.{ts,tsx}",
      "**/*.server.test.{ts,tsx}",
      "app/routes/api/**/*.ts",
    ],
    rules: {
      "no-console": "off",
    },
  },

  prettier,
);
