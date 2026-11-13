import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // These newer React Compiler checks flag existing React 18 components.
  // Keep them visible while allowing the upgrade to preserve current behavior.
  { rules: {
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/preserve-manual-memoization": "warn",
    "react-hooks/refs": "warn",
  } },
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts"]),
]);
