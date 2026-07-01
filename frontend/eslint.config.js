// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "eslint.config.js",
      "vite.config.js",
      "src/pages/**/*.js",
    ]
  },
  eslint.configs.recommended,
  
  
  ...tseslint.configs.recommended,
  
  
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }], 
      "prefer-const": "error",     
      "@typescript-eslint/no-explicit-any": "error", 
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^createElement$" }] 
    }
  }
);