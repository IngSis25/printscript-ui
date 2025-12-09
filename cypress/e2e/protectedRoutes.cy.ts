import {AUTH0_USERNAME, AUTH0_PASSWORD, FRONTEND_URL} from "../../src/utils/constants";

describe('Protected routes test', () => {
    it('should redirect to login when accessing a protected route unauthenticated', () => {
        // Visit the protected route
        cy.visit(FRONTEND_URL + '/rules');

        cy.wait(1000)

        // Adjust the origin based on actual content
        cy.origin('https://dev-2dc74voarsscuyp0.us.auth0.com', () => {
            cy.url().should('include', '/login');
        });
    });

    it('should display login content', () => {
        // Visit the login page
        cy.visit(FRONTEND_URL);
        cy.wait(1000)

        // Look for text that is likely to appear on a login page
        cy.origin('https://dev-2dc74voarsscuyp0.us.auth0.com', () => {
            cy.contains('Log in').should('exist');
            cy.contains('Password').should('exist');
        });
    });

    it('should not redirect to login when the user is already authenticated', () => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )

        cy.visit('/');

        cy.wait(5000)

        // Check if the URL is redirected to the login page
        cy.url().should('not.include', '/login');
    });

})
