import {
    AUTH0_PASSWORD,
    AUTH0_USERNAME,
    FRONTEND_URL
} from "../../src/utils/constants";

describe("Add snippet tests", () => {
    beforeEach(() => {
        cy.viewport(1000, 980)
        cy.loginToAuth0(AUTH0_USERNAME, AUTH0_PASSWORD);
    });

    it("Can add snippets manually", () => {
        cy.intercept("POST", "**/api/api/snippets", (req) => {
            req.reply((res) => {
                expect(res.body).to.include.keys("id", "name", "content", "language");
                expect(res.statusCode).to.eq(200);
            });
        }).as("postRequest");

        cy.visit(FRONTEND_URL);

        cy.wait(5000);

        cy.get(".css-9jay18 > .MuiButton-root").first().click();
        cy.get(".MuiList-root > [tabindex='0']").first().click();

        cy.get("#name").type("Some snippet name");

        cy.get("#demo-simple-select").click();

        // Wait for menu to open and select the first language option
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[data-testid^="menu-option-"]').first().click();

        cy.get('[data-testid="add-snippet-code-editor"]').click();
        cy.get('[data-testid="add-snippet-code-editor"]').type(
            'const snippet: String = "some snippet" \n print(snippet)'
        );

        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait("@postRequest")
            .its("response.statusCode")
            .should("eq", 200);
    });

    it("Can add snippets via file", () => {
        cy.intercept("POST", "**/api/api/snippets", (req) => {
            req.reply((res) => {
                expect(res.body).to.include.keys("id", "name", "content", "language");
                expect(res.statusCode).to.eq(200);
            });
        }).as("postRequest");

        cy.visit(FRONTEND_URL);

        cy.wait(5000);

        // Subir archivo
        cy.get('[data-testid="upload-file-input"]').selectFile(
            "cypress/fixtures/example_ps.ps",
            { force: true }
        );

        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait("@postRequest")
            .its("response.statusCode")
            .should("eq", 200);
    });
});
