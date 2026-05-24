import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    // Increased timeouts for CI environments where things are slower
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    // Additional CI-specific timeouts
    taskTimeout: 10000,
    execTimeout: 10000,
    // Browser security
    chromeWebSecurity: false,
    // Disable video for faster CI runs
    video: false,
    // Screenshot on failure
    screenshotOnFailure: true,
    // Continue tests on error
    uncaught: true,
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
