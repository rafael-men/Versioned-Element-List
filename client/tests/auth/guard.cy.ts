import { MOCK_TOKEN, mockLists } from '../support/mocks'

describe('Guardas de autenticação (frontend)', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    mockLists()
  })

  it('redireciona visitante não autenticado de / para /auth/login', () => {
    cy.visit('/')
    cy.url().should('contain', '/auth/login')
    cy.contains('Entrar').should('be.visible')
  })

  it('redireciona usuário com token de /auth/login para /', () => {
    cy.window().then((window) => {
      window.localStorage.setItem('vel_token', MOCK_TOKEN)
    })

    cy.visit('/auth/login')
    cy.url().should((url) => {
      expect(url).to.include('/')
      expect(url).to.not.include('/auth')
    })
  })
})