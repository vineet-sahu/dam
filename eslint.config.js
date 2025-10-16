import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierPlugin from "eslint-plugin-prettier";
import globals from "globals";

export default [
  
  {
    files: ["frontend/**/*.{ts,tsx}"],
    ignores: ["frontend/node_modules/", "frontend/dist/", "frontend/build/", "frontend/coverage/"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./frontend/tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "prettier/prettier": "error",
      "no-console": ["error", { "allow": ["warn", "error"] }],
      "no-console": "off",
      "no-debugger": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/react-in-jsx-scope": "off", 
      "react/prop-types": "off", 
      "react/jsx-uses-react": "off", 
      "react/jsx-uses-vars": "warn",
    },
  },

  
  {
    files: ["backend/**/*.{js,ts}"],
    ignores: ["backend/node_modules/", "backend/dist/", "backend/build/", "backend/sec/seeders/", 
      "backend/src/config/database.js"
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./backend/tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-explicit-any": "off", 
      "no-process-exit": "off",
      "no-console": ["error", { "allow": ["warn", "error"] }],
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];