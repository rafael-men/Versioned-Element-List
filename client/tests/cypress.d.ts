/// <reference types="cypress" />

export {}

declare global {
  namespace Cypress {
    interface Chainable {
      mockAuth(): Chainable<void>
      mockLists(): Chainable<void>
    }
  }
}