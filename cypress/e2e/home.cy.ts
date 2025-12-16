import {AUTH0_PASSWORD, AUTH0_USERNAME, FRONTEND_URL} from "../../src/utils/constants";

describe('Home', () => {
    beforeEach(() => {
        cy.viewport(1000, 980)
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )
    })
    before(() => {
        process.env.FRONTEND_URL = Cypress.env("FRONTEND_URL");
        process.env.BACKEND_URL = Cypress.env("BACKEND_URL");
    })
    it('Renders home', () => {
        cy.visit(FRONTEND_URL)
        cy.wait(10000)
        /* ==== Generated with Cypress Studio ==== */
        cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
        cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').should('be.visible');
        cy.get('.css-9jay18 > .MuiButton-root').should('be.visible');
        cy.get('.css-jie5ja').click();
        /* ==== End Cypress Studio ==== */
    })

    // You need to have at least 1 snippet in your DB for this test to pass
    it('Renders the first snippets', () => {
        cy.visit(FRONTEND_URL)

        cy.wait(4000)

        const first10Snippets = cy.get('[data-testid="snippet-row"]')

        first10Snippets.should('have.length.greaterThan', 0)

        first10Snippets.should('have.length.lessThan', 11)
    })

    it('Can create snippet find snippets by name', () => {
        cy.intercept('GET', "**/api/api/snippets/user*").as('getSnippets');

        cy.visit(FRONTEND_URL)
        cy.wait("@getSnippets", { timeout: 10000 });

        const snippetData = {
            name: "Test name",
            content: "print(1)",
            language: "Printscript",
            extension: ".ps",
            version: "1.0",
            owner: "test@gmail.com",
            languageId: 1,
        }


        cy.window().then((win) => {
            const token = win.localStorage.getItem('access_token');
            expect(token).to.exist;

            cy.request({
                method: 'POST',
                url: 'http://localhost:5174/api/api/snippets',
                body: snippetData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                failOnStatusCode: false, // mantenelo mientras debugueás
            }).then((response) => {
                cy.log(JSON.stringify(response.body));

                expect(response.status).to.eq(200);

                expect(response.body.name).to.eq(snippetData.name);
                expect(response.body.content).to.eq(snippetData.content);
                expect(response.body.language).to.eq("Printscript");
                expect(response.body).to.have.property("id");

                cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').clear();
                cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input')
                    .type(snippetData.name + "{enter}");

                cy.wait("@getSnippets", { timeout: 10000 });
                cy.contains(snippetData.name).should('exist');
            });
        })
    })
})
