import { MOCK_TOKEN, mockAuthenticatedLists } from '../support/mocks'

describe('Guardas de autenticação (frontend)', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    mockAuthenticatedLists()
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

  it('redireciona usuário com token de /auth/register para /', () => {
    cy.window().then((window) => {
      window.localStorage.setItem('vel_token', MOCK_TOKEN)
    })

    cy.visit('/auth/register')
    cy.url().should((url) => {
      expect(url).to.include('/')
      expect(url).to.not.include('/auth')
    })
  })

  it('mantém usuário autenticado em rota protegida', () => {
    cy.window().then((window) => {
      window.localStorage.setItem('vel_token', MOCK_TOKEN)
    })

    cy.visit('/')
    cy.url().should('not.contain', '/auth')
    cy.contains('button', 'Sair').should('be.visible')
  })

  it('envia o token no header Authorization das requisições autenticadas', () => {
    cy.window().then((window) => {
      window.localStorage.setItem('vel_token', MOCK_TOKEN)
    })

    cy.visit('/')
    cy.contains('button', 'Sair').should('be.visible')
  })
})