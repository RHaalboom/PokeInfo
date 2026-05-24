import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 4000,
    requestTimeout: 5000,
    responseTimeout: 5000,
    chromeWebSecurity: false,
    video: false,
    screenshotOnFailure: true,
    setupNodeEvents() {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.js',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'cypress/component/**/*.cy.js',
  },
})
