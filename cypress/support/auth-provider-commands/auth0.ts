import { AUTH0_DOMAIN, FRONTEND_URL } from '../constants';

export function loginViaAuth0Ui(username: string, password: string) {
  // App landing page redirects to Auth0.
  cy.visit('/')

  // Login on Auth0.
  cy.origin(
      AUTH0_DOMAIN,
      { args: { username, password } },
      ({ username, password }) => {
        cy.get('input#username').type(username)
        cy.get('input#password').type(password, { log: false })
        cy.contains('button[value=default]', 'Continue').click()
      }
  )

  // Ensure Auth0 has redirected us back to the app.
  cy.url().should('include', FRONTEND_URL)
}




