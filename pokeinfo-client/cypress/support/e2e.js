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
