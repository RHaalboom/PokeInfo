// Registration Flow - Tests for user account registration
describe('Registration - Happy Path', () => {
  beforeEach(() => {
    cy.visit('/register')
  })

  it('should display the registration page', () => {
    cy.get('[data-cy="register-page"]').should('be.visible')
  })

  it('should have all required form fields', () => {
    cy.get('[data-cy="register-username"]').should('be.visible')
    cy.get('[data-cy="register-email"]').should('be.visible')
    cy.get('[data-cy="register-password"]').should('be.visible')
    cy.get('[data-cy="register-confirm-password"]').should('be.visible')
    cy.get('[data-cy="register-submit"]').should('be.visible')
  })

  it('should successfully register with valid credentials', () => {
    const timestamp = Date.now()
    const email = `testuser${timestamp}@example.com`
    const username = `testuser${timestamp}`
    const password = 'SecurePassword123!'

    cy.get('[data-cy="register-username"]').type(username)
    cy.get('[data-cy="register-email"]').type(email)
    cy.get('[data-cy="register-password"]').type(password)
    cy.get('[data-cy="register-confirm-password"]').type(password)
    cy.get('[data-cy="register-submit"]').click()

    // Should redirect to login or dashboard after successful registration
    cy.url().should('not.include', '/register')
    cy.get('[data-cy="register-success-message"]').should('be.visible')
  })

  it('should navigate to login page from registration', () => {
    cy.get('[data-cy="login-link"]').click()
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-page"]').should('be.visible')
  })
})

describe('Registration - Unhappy Path', () => {
  beforeEach(() => {
    cy.visit('/register')
  })

  it('should show error when passwords do not match', () => {
    cy.get('[data-cy="register-username"]').type('testuser')
    cy.get('[data-cy="register-email"]').type('test@example.com')
    cy.get('[data-cy="register-password"]').type('Password123!')
    cy.get('[data-cy="register-confirm-password"]').type('DifferentPassword123!')
    cy.get('[data-cy="register-submit"]').click()

    cy.get('[data-cy="register-error-message"]').should('be.visible')
    cy.get('[data-cy="register-error-message"]').should('contain', 'password')
  })

  it('should show error when email is already registered', () => {
    const existingEmail = 'existing@example.com'

    cy.get('[data-cy="register-username"]').type('newuser')
    cy.get('[data-cy="register-email"]').type(existingEmail)
    cy.get('[data-cy="register-password"]').type('Password123!')
    cy.get('[data-cy="register-confirm-password"]').type('Password123!')
    cy.get('[data-cy="register-submit"]').click()

    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })

  it('should show error for invalid email format', () => {
    cy.get('[data-cy="register-username"]').type('testuser')
    cy.get('[data-cy="register-email"]').type('invalidemail')
    cy.get('[data-cy="register-password"]').type('Password123!')
    cy.get('[data-cy="register-confirm-password"]').type('Password123!')
    cy.get('[data-cy="register-submit"]').click()

    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })

  it('should show error when required fields are empty', () => {
    cy.get('[data-cy="register-submit"]').click()
    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })

  it('should show error for weak password', () => {
    cy.get('[data-cy="register-username"]').type('testuser')
    cy.get('[data-cy="register-email"]').type('test@example.com')
    cy.get('[data-cy="register-password"]').type('weak')
    cy.get('[data-cy="register-confirm-password"]').type('weak')
    cy.get('[data-cy="register-submit"]').click()

    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })
})

// Login Flow - Tests for user authentication
describe('Login - Happy Path', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display the login page', () => {
    cy.get('[data-cy="login-page"]').should('be.visible')
  })

  it('should have all required form fields', () => {
    cy.get('[data-cy="login-email"]').should('be.visible')
    cy.get('[data-cy="login-password"]').should('be.visible')
    cy.get('[data-cy="login-submit"]').should('be.visible')
  })

  it('should successfully login with valid credentials', () => {
    cy.login('testuser@example.com', 'TestPassword123!')
    cy.isLoggedIn()
    cy.url().should('not.include', '/login')
  })

  it('should redirect to dashboard after successful login', () => {
    cy.login('testuser@example.com', 'TestPassword123!')
    cy.url().should('include', '/')
  })

  it('should navigate to registration page from login', () => {
    cy.get('[data-cy="register-link"]').click()
    cy.url().should('include', '/register')
    cy.get('[data-cy="register-page"]').should('be.visible')
  })
})

describe('Login - Unhappy Path', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should show error with invalid email format', () => {
    cy.get('[data-cy="login-email"]').type('invalidemail')
    cy.get('[data-cy="login-password"]').type('Password123!')
    cy.get('[data-cy="login-submit"]').click()

    cy.get('[data-cy="login-error-message"]').should('be.visible')
  })

  it('should show error when email is empty', () => {
    cy.get('[data-cy="login-password"]').type('Password123!')
    cy.get('[data-cy="login-submit"]').click()

    cy.get('[data-cy="login-error-message"]').should('be.visible')
  })

  it('should show error when password is empty', () => {
    cy.get('[data-cy="login-email"]').type('test@example.com')
    cy.get('[data-cy="login-submit"]').click()

    cy.get('[data-cy="login-error-message"]').should('be.visible')
  })

  it('should show error with incorrect credentials', () => {
    cy.get('[data-cy="login-email"]').type('nonexistent@example.com')
    cy.get('[data-cy="login-password"]').type('WrongPassword123!')
    cy.get('[data-cy="login-submit"]').click()

    cy.get('[data-cy="login-error-message"]').should('be.visible')
    cy.get('[data-cy="login-error-message"]').should('contain', 'Invalid')
  })

  it('should show error when fields are empty', () => {
    cy.get('[data-cy="login-submit"]').click()
    cy.get('[data-cy="login-error-message"]').should('be.visible')
  })

  it('should remain on login page after failed login', () => {
    cy.get('[data-cy="login-email"]').type('wrong@example.com')
    cy.get('[data-cy="login-password"]').type('WrongPassword123!')
    cy.get('[data-cy="login-submit"]').click()

    cy.url().should('include', '/login')
  })
})

// Logout Flow - Tests for user logout
describe('Logout', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.login('testuser@example.com', 'TestPassword123!')
    cy.isLoggedIn()
  })

  it('should display logout button when user is logged in', () => {
    cy.get('[data-cy="logout-button"]').should('be.visible')
  })

  it('should successfully logout', () => {
    cy.logout()
    cy.isLoggedOut()
  })

  it('should redirect to home page after logout', () => {
    cy.logout()
    cy.url().should('include', '/')
  })

  it('should be redirected to login when accessing protected page after logout', () => {
    cy.logout()
    cy.visit('/profile')
    cy.url().should('include', '/login')
  })
})

// Protected Routes - Tests for access control
describe('Protected Routes - Access Control', () => {
  it('should redirect to login when accessing profile without authentication', () => {
    cy.visit('/profile')
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-page"]').should('be.visible')
  })

  it('should redirect to login when accessing settings without authentication', () => {
    cy.visit('/settings')
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-page"]').should('be.visible')
  })

  it('should redirect to login when accessing collection without authentication', () => {
    cy.visit('/collection')
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-page"]').should('be.visible')
  })

  it('should allow access to protected pages when authenticated', () => {
    cy.visit('/login')
    cy.login('testuser@example.com', 'TestPassword123!')
    cy.isLoggedIn()

    cy.visit('/profile')
    cy.url().should('include', '/profile')
    cy.get('[data-cy="profile-page"]').should('be.visible')
  })

  it('should not show logout button on unauthenticated pages', () => {
    cy.visit('/')
    cy.isLoggedOut()
  })

  it('should show logout button on authenticated state', () => {
    cy.visit('/login')
    cy.login('testuser@example.com', 'TestPassword123!')
    cy.visit('/profile')
    cy.get('[data-cy="logout-button"]').should('be.visible')
  })
})
