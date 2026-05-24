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

// Clear all auth state and local storage for test isolation
Cypress.Commands.add('clearAuthState', () => {
  try {
    cy.window().then((win) => {
      try {
        win.localStorage.clear()
        win.sessionStorage.clear()
      } catch (e) {
        cy.log('⚠️ Could not clear storage: ' + e.message)
      }
    })
    cy.clearCookies()
    cy.log('✅ Auth state cleared for test isolation')
  } catch (e) {
    cy.log('⚠️ Error clearing auth state: ' + e.message)
  }
})

// Delete a user via API (for cleanup)
Cypress.Commands.add('deleteUser', (email) => {
  cy.request({
    method: 'DELETE',
    url: `/api/users/${email}`,
    failOnStatusCode: false,
  }).then((response) => {
    cy.log(`🗑️ User ${email} cleanup: ${response.status}`)
  }).catch((error) => {
    cy.log(`⚠️ Failed to delete user ${email}: ${error.message}`)
  })
})
