import {AUTH0_PASSWORD, AUTH0_USERNAME} from "../../src/utils/constants";

describe('Add snippet tests', () => {
    beforeEach(() => {
        cy.viewport(1000, 980)
        cy.intercept('GET', "**/api/api/snippets/*", {
            statusCode: 200,
            body: snippet,
        }).as("getSnippetById")

        cy.intercept({
            method: 'GET',
            url: /.*\/api\/api\/snippets\/user.*/
        }, {
            statusCode: 200,
            body: {
                page: 1,
                page_size: 1,
                count: 1,
                snippets: [ snippet ]
            },
        }).as("getSnippets");

        cy.intercept('GET', "**/api/api/auth0/users*", (req) => {
            const searchParam = String(req.query.search || '');
            if (!searchParam || searchParam.includes('azulgarber')) {
                req.reply({
                    statusCode: 200,
                    body: [ { id: "2", email: "azulgarber@gmail.com" } ]
                });
            } else {
                req.reply({
                    statusCode: 200,
                    body: []
                });
            }
        })

        cy.intercept('GET', "**/api/api/tests/snippet/*", {
            statusCode: 200,
            body: []
        }).as("getTestCases")

        cy.intercept('POST', "**/api/api/tests/snippet/*", {
            statusCode: 200,
            body: {
                id: "1",
                name: "Test 1",
                input: [],
                output: ["1"]
            }
        }).as("postTestCase")

        cy.intercept('POST', "**/api/api/tests/**/run", {
            statusCode: 200,
            body: "success"
        }).as("runTest")

        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )

        cy.visit("/")
        
        cy.wait("@getSnippets", { timeout: 15000 })
        
        cy.get('[data-testid="snippet-row"]', { timeout: 10000 })
            .should('exist')
            .should('be.visible')
            .should('have.length.at.least', 1)
        
        cy.get('[data-testid="snippet-row"]').first().as('firstSnippetRow')
        cy.get('@firstSnippetRow').should('be.visible').click()
    })

    it('Can share a snippet ', () => {
        cy.get('[aria-label="Share"]').click();
        
        cy.contains('Share your snippet').should('be.visible');
        
        cy.contains('Share your snippet').parent().within(() => {
            cy.get('input[type="text"]').first()
                .should('be.visible')
                .clear()
                .type('azulgarber@gmail', { force: true });
        });
        
        cy.wait(600);
        
        cy.get('[role="listbox"]', { timeout: 5000 })
            .should('be.visible')
            .within(() => {
                cy.contains('azulgarber@gmail.com').should('be.visible').click();
            });
        
        cy.contains('button', 'Share').should('be.enabled').click();
        
        cy.contains('Share your snippet').should('not.exist');
    })

    it('Can run snippets', function () {
        cy.intercept('GET', '**/api/api/tests/snippet/*', {
            statusCode: 200,
            body: [
                {
                    id: '1',
                    name: 'Prueba',
                    input: [],
                    output: ['1'],
                },
            ],
        }).as('getTestCasesAfterSave');

        cy.get('button[aria-label="Test"]').click();

        cy.contains('Test snippet').should('be.visible');

        cy.contains('Test snippet')
            .closest('div')
            .as('testPanel');

        cy.get('@testPanel')
            .find('svg[data-testid="AddRoundedIcon"]')
            .parent()
            .click();

        cy.get('@testPanel').within(() => {
            cy.contains('Name').should('be.visible');
            cy.contains('Input').should('be.visible');
            cy.contains('Output').should('be.visible');
        });

        cy.get('@testPanel')
            .contains('Name')
            .should('be.visible')
            .parent()
            .find('input')
            .first()
            .should('be.visible')
            .clear()
            .type('Prueba');

        cy.get('@testPanel')
            .contains('Output')
            .should('be.visible')
            .parent()
            .find('input')
            .first()
            .should('be.visible')
            .click({ force: true })
            .type('1{enter}', { force: true });

        cy.get('@testPanel')
            .contains('button', 'Save')
            .should('be.enabled')
            .click();

        cy.wait('@postTestCase', { timeout: 5000 });

        cy.wait('@getTestCasesAfterSave', { timeout: 5000 });

        cy.wait(300);

        cy.contains('Test guardado correctamente', { timeout: 3000 }).should('exist');

        cy.contains('button', 'Test', { timeout: 5000 })
            .should('be.enabled')
            .should('be.visible')
            .as('testButton');

        cy.get('@testButton').click();

        cy.wait('@runTest', { timeout: 10000 });

        cy.contains('Test ejecutado correctamente', { timeout: 8000 })
            .should('exist')
            .then(() => cy.wait(300));

        cy.contains('Test snippet').should('be.visible');
    });




    it('Can format snippets', function() {
        cy.get('[data-testid="ReadMoreIcon"] > path').click();
    });

    it('Can save snippets', function() {
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').click();
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').type("Some new line");
        cy.get('[data-testid="SaveIcon"] > path').click();
    });

    it('Can delete snippets', function() {
        cy.get('[data-testid="DeleteIcon"] > path').click();
    });
})

const snippet = {
    id: "1",
    name: "Test name",
    content: "print(1);",
    language: "printscript",
    extension: 'ps',
    compliance: 'pending',
    author: 'test@gmail.com',
    owner: 'test@gmail.com',
}