// Support file for Cypress E2E tests
// Place code here that runs before your test files

// Alternatively you can use CommonJS syntax:
// require('./commands')

import './commands'

// Hide XHR and fetch requests in the command log
const app = window.top

if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style')
  style.innerHTML =
    '.command-name-request, .command-name-xhr, .command-name-fetch { display: none }'
  style.setAttribute('data-hide-command-log-request', '')

  app.document.head.appendChild(style)
}

// Better error handling for CI environments
// Return false to log errors but allow tests to continue
Cypress.on('uncaught:exception', (err, runnable) => {
  console.error('Uncaught exception:', err.message)
  return false
})

// Log test lifecycle events for better debugging in CI
beforeEach(function() {
  if (this.currentTest) {
    cy.log(`🧪 Starting test: ${this.currentTest.title}`)
  }
})

afterEach(function() {
  // Log test completion
  if (this.currentTest) {
    if (this.currentTest.state === 'passed') {
      cy.log(`✅ Test passed: ${this.currentTest.title}`)
    } else if (this.currentTest.state === 'failed') {
      cy.log(`❌ Test failed: ${this.currentTest.title}`)
    }
  }
})
