// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 1. Aktiviert die offiziellen Standard-Empfehlungen für JavaScript
  eslint.configs.recommended,
  
  // 2. Aktiviert die offiziellen Empfehlungen für TypeScript
  ...tseslint.configs.recommended,
  
  // 3. Eure maßgeschneiderten Regeln für das Projekt
  {
    rules: {
      "no-console": "warn",        // Gelbe Warnung bei vergessenen console.logs
      "prefer-const": "error",     // Roter Fehler, wenn ein 'let' nicht verändert wird (Vermeidung von Redundanz!)
      "@typescript-eslint/no-explicit-any": "warn", // Warnt dich, wenn du schummelst und 'any' nutzt
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }] // Fehler bei ungenutzten Variablen
    }
  }
);