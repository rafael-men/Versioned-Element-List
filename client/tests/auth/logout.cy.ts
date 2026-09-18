import { MOCK_TOKEN, mockAuthenticatedLists, mockPublicUser } from '../support/mocks'

describe('Logout (frontend)', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    mockAuthenticatedLists()
  })

  it('limpa a sessão e redireciona para o login ao sair', () => {
    cy.window().then((window) => {
      window.localStorage.setItem('vel_token', MOCK_TOKEN)
      window.localStorage.setItem(
        'vel_user',
        JSON.stringify(mockPublicUser('usuario@teste.com')),
      )
    })

    cy.visit('/')
    cy.contains('button', 'Sair').click()

    cy.window().its('localStorage').then((store) => {
      expect(store.getItem('vel_token')).to.be.null
      expect(store.getItem('vel_user')).to.be.null
    })

    cy.url().should('contain', '/auth/login')
    cy.contains('Entrar').should('be.visible')
  })
})