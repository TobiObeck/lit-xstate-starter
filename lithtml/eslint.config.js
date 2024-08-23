import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...compat.extends('plugin:lit/recommended'),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      semi: ['error', 'never'],
      // 'prettier/prettier': ['error'], // Enforces Prettier rules as ESLint errors
    },
  },
  // sets up both eslint-plugin-prettier and eslint-config-prettier (disable conflicting prettier rules) in one go
  // so basically 'prettier/prettier': ['error'], // Enforces Prettier rules as ESLint errors
  eslintPluginPrettierRecommended,
]
