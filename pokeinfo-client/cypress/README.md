# Cypress E2E Tests - CI/CD Troubleshooting Guide

## Common Issues and Solutions

### 1. Tests Pass Locally but Fail in CI

#### Symptoms
- Tests run successfully on local machine
- Same tests fail in GitHub Actions pipeline
- Different error messages between local and CI environments

#### Common Causes and Solutions

**A. Timing Issues**
- **Problem**: CI environments are slower; timeouts that work locally may fail in CI
- **Solution**: Increased default timeouts from 4s to 8s, request timeouts to 10s
- **Status**: ✅ IMPLEMENTED in cypress.config.js

**B. Test State Pollution**
- **Problem**: Tests affect each other due to shared state (localStorage, sessionStorage, cookies)
- **Solution**: Added `cy.clearAuthState()` command that clears all storage before each test
- **Status**: ✅ IMPLEMENTED in all test describe blocks

**C. API Dependency**
- **Problem**: Tests depend on backend API that may not be running in CI
- **Workaround**: Currently tests assume API is available at `${{ secrets.VITE_API_BASE_URL }}`
- **TODO**: Consider mocking API responses or documenting API setup requirements

**D. Development Server Not Ready**
- **Problem**: Tests start before Vite dev server is fully ready
- **Solution**: Increased wait time from 30s to 60s, improved health checks
- **Status**: ✅ IMPLEMENTED in ui-tests.yml

**E. Chrome Headless Mode Differences**
- **Problem**: Headless Chrome behaves differently than normal Chrome
- **Workaround**: Tests configured for headless Chrome specifically
- **Note**: Monitor for rendering or timing differences

### 2. Environment Variables

The workflow sets:
- `VITE_API_BASE_URL`: Backend API URL (defaults to http://localhost:3000)
  - Override via GitHub Secrets if using different API URL in CI

### 3. Test Data Cleanup

All test users created during registration tests are automatically cleaned up at the end:
- Uses `cy.deleteUser()` command for each created user
- Endpoint: `DELETE /api/users/{email}`
- Gracefully handles errors if endpoint doesn't exist

### 4. Debugging Failed Tests in CI

When tests fail in the pipeline:
1. **Check the Cypress videos and screenshots** (uploaded as artifacts)
2. **Review the vite server logs** (output in "Collect server logs on failure" step)
3. **Check GitHub Actions logs** for timing and network information
4. **Run tests locally** to reproduce the issue
5. **Add `.only` to a failing test** locally to debug faster

### 5. Adding New Tests

When adding new tests:
1. Add `cy.clearAuthState()` in the `beforeEach()` hook
2. Track any created test data in the `createdUsers` array for cleanup
3. Use data-cy attributes for element selection (more reliable than CSS selectors)
4. Use reasonable timeouts that account for CI being slower
5. Test in both local and CI environments before merging

### 6. Current Configuration

**Timeouts:**
- Default Command Timeout: 8000ms (8 seconds)
- Request/Response Timeout: 10000ms (10 seconds)
- Task Timeout: 10000ms (10 seconds)

**Retries:**
- CI Mode: 1 retry for failed tests
- Local Mode: No retries

**Browser:**
- Chrome (headless in CI, normal in local)

**Viewport:**
- 1280x720 (desktop resolution)

### 7. Next Steps to Investigate

If tests still fail in CI after these changes:
1. **Get actual error logs** from the failed pipeline run
2. **Check if backend API is running** - may need to start it in the workflow
3. **Review specific test failures** - which tests fail, what errors are shown
4. **Check for network/port issues** - whether localhost:5173 is actually accessible
5. **Monitor timing** - if delays are still causing timeouts

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [GitHub Actions with Cypress](https://docs.cypress.io/guides/continuous-integration/github-actions)
