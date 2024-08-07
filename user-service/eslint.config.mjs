import globals from "globals";
import pluginJs from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/*.min.js",
      "**/tests/",
      "**/__tests__/",
    ]
  },
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      globals: globals.node,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-inferrable-types": "warn",

      // Prettier integration
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: true,
          trailingComma: "all",
          arrowParens: "always",
          tabWidth: 2,
          printWidth: 100,
        },
      ],

      // General rules
      "no-console": "warn",
      "no-debugger": "warn",
      "no-unused-vars": "off", // Disabled because we use @typescript-eslint/no-unused-vars
    },
  },
  {
    // Add Prettier configurations directly
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
            semi: true,
            singleQuote: true,
            trailingComma: "all",
            arrowParens: "always",
            tabWidth: 2,
            printWidth: 100,
          },
        ]
    },
  },
  {
    // Ensure compatibility with Prettier
    settings: {
      prettier: prettierConfig,
    },
  },
];
