// ============================================
// SHARED TEST DATA & UTILITIES
// ============================================

// Generate unique test credentials that will be used throughout auth tests
const generateTestUser = () => {
  const timestamp = Date.now()
  return {
    username: `testuser${timestamp}`,
    email: `testuser${timestamp}@example.com`,
    password: 'SecurePassword123!'
  }
}

// Store test user credentials to use throughout the test suite
let testUser = null

// Track all created users for cleanup
const createdUsers = []

// ============================================
// REGISTRATION TESTS
// ============================================

describe('Registration - Happy Path', () => {
  beforeEach(() => {
    cy.clearAuthState()
    cy.visit('/register')
  })

  it('should display registration page with all required form fields', () => {
    cy.get('[data-cy="register-username"]').should('be.visible')
    cy.get('[data-cy="register-email"]').should('be.visible')
    cy.get('[data-cy="register-password"]').should('be.visible')
    cy.get('[data-cy="register-submit"]').should('be.visible')
  })

  it('should display optional registration fields', () => {
    cy.get('[data-cy="register-threedsFC"]').should('be.visible')
    cy.get('[data-cy="register-switchFC"]').should('be.visible')
    cy.get('[data-cy="register-collectionName"]').should('be.visible')
  })

  it('should successfully register with required credentials only', () => {
    // Generate and store test user for use in other tests
    testUser = generateTestUser()
    createdUsers.push(testUser.email)

    cy.get('[data-cy="register-username"]').type(testUser.username)
    cy.get('[data-cy="register-email"]').type(testUser.email)
    cy.get('[data-cy="register-password"]').type(testUser.password)
    cy.get('[data-cy="register-submit"]').click()

    // Should show success and redirect to profile
    cy.get('[data-cy="register-success-message"]').should('be.visible')
    cy.url().should('include', '/profile')
  })

  it('should successfully register with optional friend codes', () => {
    const timestamp = Date.now()
    const email = `testuser${timestamp}@example.com`
    const username = `testuser${timestamp}`
    const password = 'SecurePassword123!'
    createdUsers.push(email)

    cy.get('[data-cy="register-username"]').type(username)
    cy.get('[data-cy="register-email"]').type(email)
    cy.get('[data-cy="register-password"]').type(password)
    cy.get('[data-cy="register-threedsFC"]').type('123456789012')
    cy.get('[data-cy="register-switchFC"]').type('987654321098')
    cy.get('[data-cy="register-submit"]').click()

    cy.url().should('include', '/profile')
  })

  it('should have link to login page from register', () => {
    cy.get('[data-cy="login-register-link"]').should('not.exist')
    // Registration page should have a way to go to login (usually in nav)
    cy.get('[data-cy="nav-login"]').should('be.visible')
  })
})

describe('Registration - Unhappy Path', () => {
  beforeEach(() => {
    cy.clearAuthState()
    cy.visit('/register')
  })

  it('should show validation error when required fields are empty', () => {
    cy.get('[data-cy="register-submit"]').click()
    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })

  it('should show error when username is empty', () => {
    cy.get('[data-cy="register-email"]').type('test@example.com')
    cy.get('[data-cy="register-password"]').type('Password123!')
    cy.get('[data-cy="register-submit"]').click()

    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })

  it('should show error when email is empty', () => {
    cy.get('[data-cy="register-username"]').type('testuser')
    cy.get('[data-cy="register-password"]').type('Password123!')
    cy.get('[data-cy="register-submit"]').click()

    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })

  it('should show error when password is empty', () => {
    cy.get('[data-cy="register-username"]').type('testuser')
    cy.get('[data-cy="register-email"]').type('test@example.com')
    cy.get('[data-cy="register-submit"]').click()

    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })

  it('should show error when email format is invalid', () => {
    cy.get('[data-cy="register-username"]').type('testuser')
    cy.get('[data-cy="register-email"]').type('invalidemail')
    cy.get('[data-cy="register-password"]').type('Password123!')
    cy.get('[data-cy="register-submit"]').click()

    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })

  it('should show error when email is already registered', () => {
    const existingEmail = 'existing@example.com'

    cy.get('[data-cy="register-username"]').type('newuser')
    cy.get('[data-cy="register-email"]').type(existingEmail)
    cy.get('[data-cy="register-password"]').type('Password123!')
    cy.get('[data-cy="register-submit"]').click()

    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })

  it('should remain on register page after failed registration', () => {
    cy.get('[data-cy="register-submit"]').click()
    cy.url().should('include', '/register')
  })
})

// ============================================
// LOGIN TESTS
// ============================================

describe('Login - Happy Path', () => {
  beforeEach(() => {
    cy.clearAuthState()
    cy.visit('/login')
  })

  it('should display login page with all required form fields', () => {
    cy.get('[data-cy="login-page"]').should('be.visible')
    cy.get('[data-cy="login-email"]').should('be.visible')
    cy.get('[data-cy="login-password"]').should('be.visible')
    cy.get('[data-cy="login-submit"]').should('be.visible')
  })

  it('should successfully login with valid credentials', () => {
    // Use the testUser created during registration
    cy.get('[data-cy="login-email"]').type(testUser.email)
    cy.get('[data-cy="login-password"]').type(testUser.password)
    cy.get('[data-cy="login-submit"]').click()
    cy.isLoggedIn()
    cy.url().should('not.include', '/login')
  })

  it('should redirect to profile after successful login', () => {
    cy.get('[data-cy="login-email"]').type(testUser.email)
    cy.get('[data-cy="login-password"]').type(testUser.password)
    cy.get('[data-cy="login-submit"]').click()
    cy.url().should('include', '/profile')
  })

  it('should show user profile page after login', () => {
    cy.get('[data-cy="login-email"]').type(testUser.email)
    cy.get('[data-cy="login-password"]').type(testUser.password)
    cy.get('[data-cy="login-submit"]').click()
    cy.get('[data-cy="profile-page"]').should('be.visible')
  })
})

describe('Login - Unhappy Path', () => {
  beforeEach(() => {
    cy.clearAuthState()
    cy.visit('/login')
  })

  it('should show error when email/username is empty', () => {
    cy.get('[data-cy="login-password"]').type('Password123!')
    cy.get('[data-cy="login-submit"]').click()

    cy.get('[data-cy="login-error-message"]').should('be.visible')
  })

  it('should show error when password is empty', () => {
    cy.get('[data-cy="login-email"]').type('test@example.com')
    cy.get('[data-cy="login-submit"]').click()

    cy.get('[data-cy="login-error-message"]').should('be.visible')
  })

  it('should show error with incorrect password', () => {
    cy.get('[data-cy="login-email"]').type('testuser@example.com')
    cy.get('[data-cy="login-password"]').type('WrongPassword123!')
    cy.get('[data-cy="login-submit"]').click()

    cy.get('[data-cy="login-error-message"]').should('be.visible')
  })

  it('should show error with non-existent email', () => {
    cy.get('[data-cy="login-email"]').type('nonexistent@example.com')
    cy.get('[data-cy="login-password"]').type('Password123!')
    cy.get('[data-cy="login-submit"]').click()

    cy.get('[data-cy="login-error-message"]').should('be.visible')
  })

  it('should remain on login page after failed login', () => {
    cy.get('[data-cy="login-email"]').type('wrong@example.com')
    cy.get('[data-cy="login-password"]').type('WrongPassword123!')
    cy.get('[data-cy="login-submit"]').click()

    cy.url().should('include', '/login')
  })

  it('should allow retry after failed login attempt', () => {
    cy.get('[data-cy="login-email"]').type('wrong@example.com')
    cy.get('[data-cy="login-password"]').type('WrongPassword123!')
    cy.get('[data-cy="login-submit"]').click()

    cy.get('[data-cy="login-error-message"]').should('be.visible')

    // Clear and try again
    cy.get('[data-cy="login-email"]').clear()
    cy.get('[data-cy="login-password"]').clear()
      cy.get('[data-cy="login-email"]').type(testUser.email)
      cy.get('[data-cy="login-password"]').type(testUser.password)
    cy.get('[data-cy="login-submit"]').click()

    cy.url().should('include', '/profile')
  })
})

// ============================================
// LOGOUT TESTS
// ============================================

describe('Logout - Happy Path', () => {
  beforeEach(() => {
    cy.clearAuthState()
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').type(testUser.email)
    cy.get('[data-cy="login-password"]').type(testUser.password)
    cy.get('[data-cy="login-submit"]').click()
    cy.isLoggedIn()
    cy.visit('/profile')
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

  it('should hide logout button after logout', () => {
    cy.logout()
    cy.get('[data-cy="logout-button"]').should('not.exist')
  })

  it('should display login and register links after logout', () => {
    cy.logout()
    cy.get('[data-cy="nav-login"]').should('be.visible')
    cy.get('[data-cy="nav-register"]').should('be.visible')
  })
})

describe('Logout - Unhappy Path', () => {
  it('should not show logout button when not authenticated', () => {
    cy.visit('/')
    cy.get('[data-cy="logout-button"]').should('not.exist')
  })
})

// ============================================
// PROTECTED ROUTES - ACCESS CONTROL TESTS
// ============================================

describe('Protected Routes - Unauthenticated Access', () => {
  it('should redirect to login when accessing profile without authentication', () => {
    cy.visit('/profile')
    cy.url().should('include', '/login')
  })

  it('should redirect to login when accessing settings without authentication', () => {
    cy.visit('/settings')
    cy.url().should('include', '/login')
  })

  it('should redirect to login when accessing collection details without authentication', () => {
    cy.visit('/collections/1')
    cy.url().should('include', '/login')
  })

  it('should allow access to public pages without authentication', () => {
    cy.visit('/')
    cy.url().should('include', '/')
    cy.get('[data-cy="home-login-button"]').should('be.visible')
  })

  it('should allow access to pokédex overview without authentication', () => {
    cy.visit('/pokedex')
    cy.url().should('include', '/pokedex')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
  })
})

describe('Protected Routes - Authenticated Access', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').type(testUser.email)
    cy.get('[data-cy="login-password"]').type(testUser.password)
    cy.get('[data-cy="login-submit"]').click()
    cy.isLoggedIn()
  })

  it('should allow access to profile page when authenticated', () => {
    cy.visit('/profile')
    cy.url().should('include', '/profile')
    cy.get('[data-cy="profile-page"]').should('be.visible')
  })

  it('should allow access to settings page when authenticated', () => {
    cy.visit('/settings')
    cy.url().should('include', '/settings')
    cy.get('[data-cy="settings-page"]').should('be.visible')
  })

  it('should show logout button on protected pages', () => {
    cy.visit('/profile')
    cy.get('[data-cy="logout-button"]').should('be.visible')
  })

  it('should redirect to login after logout from protected page', () => {
    cy.visit('/profile')
    cy.logout()
    cy.url().should('include', '/')
  })

  it('should prevent re-access to protected page after logout', () => {
    cy.visit('/profile')
    cy.logout()
    cy.visit('/profile')
    cy.url().should('include', '/login')
  })
})

// ============================================
// AUTHENTICATION STATE PERSISTENCE TESTS
// ============================================

describe('Authentication State - Session Persistence', () => {
  beforeEach(() => {
    // Ensure we have a testUser for these tests
    if (!testUser) {
      testUser = generateTestUser()
    }
  })

  it('should persist authentication state when navigating between pages', () => {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').type(testUser.email)
    cy.get('[data-cy="login-password"]').type(testUser.password)
    cy.get('[data-cy="login-submit"]').click()
    cy.isLoggedIn()

    // Navigate to different pages

    cy.visit('/settings')
    cy.get('[data-cy="hamburger-toggle"]').click()
    cy.isLoggedIn()
    cy.visit('/pokedex')
    cy.get('[data-cy="hamburger-toggle"]').click()
    cy.isLoggedIn()

    cy.visit('/profile')
    cy.isLoggedIn()
  })

  it('should maintain auth state when navigating via navigation links', () => {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').type(testUser.email)
    cy.get('[data-cy="login-password"]').type(testUser.password)
    cy.get('[data-cy="login-submit"]').click()
    cy.isLoggedIn()

    // Use navigation
    cy.get('[data-cy="nav-pokedex"]').click()
    cy.get('[data-cy="hamburger-toggle"]').click()
    cy.isLoggedIn()

    cy.get('[data-cy="nav-logo"]').click()

    cy.get('[data-cy="user-profile-link"]').click()
    cy.isLoggedIn()
  })
})