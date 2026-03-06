import {
  hooksConfig,
  importsConfig,
  jsxA11yConfig,
  prettierConfig,
  reactConfig,
  typescriptConfig
} from '@viclafouch/eslint-config-viclafouch'

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['**/node_modules/**']
  },
  ...typescriptConfig,
  ...reactConfig,
  ...hooksConfig,
  ...jsxA11yConfig,
  ...importsConfig,
  ...prettierConfig
]
