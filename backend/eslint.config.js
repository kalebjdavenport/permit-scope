import js from "@eslint/js"
import unusedImports from "eslint-plugin-unused-imports"
import ts from "typescript-eslint"

export default ts.config(js.configs.recommended, ...ts.configs.recommended, {
  plugins: {
    "unused-imports": unusedImports
  },
  rules: {
    "unused-imports/no-unused-imports": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "separate-type-imports"
      }
    ]
  }
})
