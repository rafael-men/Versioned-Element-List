import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'tests/auth/**/*.cy.ts',
    supportFile: 'tests/support/e2e.ts',
  },
})