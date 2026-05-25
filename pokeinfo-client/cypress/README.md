# Cypress E2E Tests - README

## Overview

This directory contains end-to-end (E2E) tests for the PokeInfo client application using Cypress. These tests automate user workflows to ensure the application works correctly across different scenarios.

### Current Test Coverage

- **Authentication Flows** (`e2e/auth-flows.cy.js`)
  - User registration with validation
  - User login and logout
  - Protected route access control
  - Session persistence
  - Test data cleanup

- **Pokemon Flows** (`e2e/pokemon-flows.cy.js`)
  - Pokédex browsing
  - Pokemon search and filtering
  - Collection management

## Quick Start

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Development server running (or ability to start it)

### Installation

```bash
cd pokeinfo-client
npm install
```

### Running Tests Locally

**Open Cypress Test Runner (interactive mode):**
```bash
npm run e2e
```

**Run all tests headless (like CI):**
```bash
npm run e2e:run
```

**Run tests in headed mode (see browser):**
```bash
npm run e2e:headed
```

**Run tests in specific Chrome version:**
```bash
npm run e2e:chrome
```

**Debug mode (with dev tools):**
```bash
npm run e2e:debug
```

## Project Structure

```
cypress/
├── e2e/                          # End-to-end test specs
│   ├── auth-flows.cy.js         # Authentication and session tests
│   └── pokemon-flows.cy.js       # Pokemon interaction tests
├── support/
│   ├── commands.js              # Custom Cypress commands
│   ├── e2e.js                   # Global E2E configuration
│   └── component.js             # Component test configuration
├── fixtures/                     # Test data files
├── screenshots/                  # Failed test screenshots
├── videos/                       # Test run videos
└── README.md                     # This file
```

## Configuration

See `cypress.config.js` for:
- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Viewport**: 1280x720
- **Timeouts**: 8-10 seconds (increased for CI environments)
- **Browser**: Chrome (headless in CI, normal locally)

## Available Custom Commands

### Authentication Commands

```javascript
// Login with email and password
cy.login(email, password)

// Logout the current user
cy.logout()

// Check if user is logged in
cy.isLoggedIn()

// Check if user is logged out
cy.isLoggedOut()

// Clear authentication state (localStorage, sessionStorage, cookies)
cy.clearAuthState()
```

### Cleanup Commands

```javascript
// Delete a test user via API
cy.deleteUser(email)
```

### Example Usage

```javascript
it('should login successfully', () => {
  cy.visit('/login')
  cy.login('user@example.com', 'Password123!')
  cy.isLoggedIn()
  cy.url().should('include', '/profile')
})
```

## Writing New Tests

### Best Practices

1. **Use Data Attributes for Selection**
   ```javascript
   // ✅ Good - data-cy attributes
   cy.get('[data-cy="login-submit"]').click()

   // ❌ Avoid - fragile CSS selectors
   cy.get('form button[type="submit"]').click()
   ```

2. **Clear Auth State Between Tests**
   ```javascript
   describe('My Test Suite', () => {
     beforeEach(() => {
       cy.clearAuthState()
       cy.visit('/my-page')
     })
   })
   ```

3. **Track Test Data for Cleanup**
   ```javascript
   // At top of file
   const createdUsers = []

   it('should create a user', () => {
     const testUser = generateTestUser()
     createdUsers.push(testUser.email)

     // ... test code ...
   })

   // At end of file
   after(() => {
     createdUsers.forEach(email => cy.deleteUser(email))
   })
   ```

4. **Use Realistic Timeouts**
   ```javascript
   // ✅ Increase timeout for slow operations
   cy.get('[data-cy="result"]', { timeout: 10000 }).should('be.visible')

   // ❌ Don't hardcode artificial waits
   cy.wait(5000)  // Bad practice
   ```

5. **Test User Workflows, Not Implementation**
   ```javascript
   // ✅ Test what users see and do
   it('should display error on invalid login', () => {
     cy.get('[data-cy="login-email"]').type('wrong@email.com')
     cy.get('[data-cy="login-password"]').type('wrong')
     cy.get('[data-cy="login-submit"]').click()
     cy.get('[data-cy="login-error-message"]').should('be.visible')
   })
   ```

### Adding Data Attributes to Components

To make components testable, add `data-cy` attributes:

```jsx
// In your component
<button data-cy="register-submit">Create account</button>
<span data-cy="register-error-message">{error}</span>
<input data-cy="register-username" type="text" />
```

## Running Tests in CI/CD

Tests automatically run on:
- Push to `main`, `develop`, or `feature/*` branches
- Pull requests to `main` or `develop`

The workflow:
1. Checks out code
2. Installs dependencies
3. Starts Vite dev server
4. Runs Cypress tests
5. Uploads screenshots/videos on failure

View results at: https://github.com/RHaalboom/PokeInfo/actions

## Debugging Failed Tests

### Locally

1. **Run in headed mode to see what's happening:**
   ```bash
   npm run e2e:headed
   ```

2. **Use `.only` to run a single test:**
   ```javascript
   it.only('should login', () => {
     // This test will run alone
   })
   ```

3. **Use `.skip` to skip tests:**
   ```javascript
   it.skip('should be fixed later', () => {
     // This test won't run
   })
   ```

4. **Add debug statements:**
   ```javascript
   cy.get('[data-cy="element"]')
     .debug()  // Pauses test and shows element in dev tools
     .click()
   ```

5. **Check the command log** in Cypress UI for:
   - What commands ran
   - What was selected
   - Why assertions failed

### In CI

1. Check the **GitHub Actions logs** at workflow run page
2. Download **screenshots and videos** from artifacts
3. Look for error messages in the test output
4. Common issues:
   - Timeouts (increase in cypress.config.js)
   - API unavailable (ensure backend is set up)
   - Element not found (add `data-cy` attribute)
   - State pollution (add `cy.clearAuthState()`)

## Common Issues & Solutions

### Tests Pass Locally but Fail in CI

**Cause**: CI environments are slower and have different timing.

**Solution**: 
- Timeouts are already increased to 8-10 seconds
- Add `cy.clearAuthState()` to prevent state pollution
- Avoid hardcoded waits (`cy.wait()`)

### "Element not found" errors

**Cause**: Element selector is wrong or element hasn't appeared yet.

**Solution**: 
- Ensure `data-cy` attributes exist on elements
- Increase timeout if element appears slowly:
```javascript
cy.get('[data-cy="element"]', { timeout: 10000 }).should('exist')
```

### Tests stop after first failure

**Cause**: Test suite was configured to stop on error.

**Solution**: 
- This has been fixed
- Tests now continue through all failures
- All failures are reported at end of run

### API calls failing (404, 500)

**Cause**: Backend API not running or test data doesn't exist.

**Solution**: 
- Ensure backend API is running locally or in CI
- Check `VITE_API_BASE_URL` environment variable is correct
- Verify test creates necessary data before using it

### "Wait for dev server" timeout in CI

**Cause**: Vite dev server takes too long to start or fails.

**Solution**: 
- Using Node.js 20+ (Vite requirement)
- Increased wait time to 60 seconds
- Better health checks before running tests

## Performance Tips

1. **Keep tests focused** - Each test should test one thing
2. **Don't repeat setup** - Use `beforeEach()` and custom commands
3. **Disable video** - Already done (slow in CI): `video: false`
4. **Use efficient selectors** - `data-cy` is faster than complex CSS
5. **Avoid unnecessary waits** - Let Cypress wait automatically
6. **Clean up test data** - Use `after()` hooks for cleanup

## Useful Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing React with Cypress](https://docs.cypress.io/guides/component-testing/react)
- [GitHub Actions with Cypress](https://docs.cypress.io/guides/continuous-integration/github-actions)

## Environment Variables

### Local Development

Create `.env.local` if needed:
```
VITE_API_BASE_URL=http://localhost:3000
```

### CI/CD

Set via GitHub Secrets:
- `VITE_API_BASE_URL` - Backend API URL (defaults to http://localhost:3000)

## Contributing

When adding new tests:

1. ✅ Use `data-cy` attributes for element selection
2. ✅ Add `cy.clearAuthState()` in `beforeEach()`
3. ✅ Track test data for cleanup in `after()` hook
4. ✅ Test user workflows, not implementation details
5. ✅ Use reasonable timeouts for CI (8-10 seconds)
6. ✅ Run tests locally before pushing
7. ✅ Keep tests independent and isolated

## Current Test Configuration

**Timeouts:**
- Default Command Timeout: 8000ms (8 seconds)
- Request/Response Timeout: 10000ms (10 seconds)
- Task Timeout: 10000ms (10 seconds)

**Browser:**
- Chrome (headless in CI, normal in local)

**Viewport:**
- 1280x720 (desktop resolution)

**Error Handling:**
- Uncaught exceptions logged but don't fail tests
- Tests continue running even if one fails

## Troubleshooting

### Getting Help

1. Check this README for common issues
2. Review test logs in GitHub Actions
3. Run tests locally with debug mode
4. Check Cypress documentation
5. Open an issue with:
   - Test name and code
   - Error message
   - Steps to reproduce
   - Screenshots/videos if available

### Resetting Test State

If tests are in a bad state:

```bash
# Clear browser cache and cookies
rm -rf cypress/screenshots cypress/videos

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests fresh
npm run e2e:run
```

## License

These tests are part of the PokeInfo project and follow the same license.
