// Custom Cypress commands for common test operations
// https://docs.cypress.io/api/cypress-api/custom-commands

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-cy="login-email"]').type(email)
  cy.get('[data-cy="login-password"]').type(password)
  cy.get('[data-cy="login-submit"]').click()
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="logout-button"]').click()
})

Cypress.Commands.add('isLoggedIn', () => {
  cy.get('[data-cy="logout-button"]').should('exist')
})

Cypress.Commands.add('isLoggedOut', () => {
  cy.get('[data-cy="logout-button"]').should('not.exist')
})
