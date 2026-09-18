import { randomEmail, randomPassword } from '../utils'
import { mockAuth, mockAddUser, mockLists } from '../support/mocks'

describe('Login de usuário (frontend)', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    mockAuth()
    mockLists()
    cy.visit('/auth/login')
  })

  it('exibe o formulário de login', () => {
    cy.contains('Entrar').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('button', 'Entrar').should('be.visible')
  })

  it('autentica com credenciais válidas e armazena o token', () => {
    const email = randomEmail()
    const password = randomPassword()

    mockAddUser(email, password)

    cy.intercept('POST', '**/auth/login').as('login')

    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.contains('button', 'Entrar').click()

    cy.wait('@login').then(({ response }) => {
      expect(response?.statusCode).to.be.oneOf([201, 200])
      expect(response?.body?.token).to.be.a('string').and.not.be.empty
    })

    cy.window().its('localStorage').then((store) => {
      expect(store.getItem('vel_token')).to.not.be.null
    })
  })

  it('mostra erro ao usar credenciais inválidas', () => {
    cy.get('input[type="email"]').type(randomEmail())
    cy.get('input[type="password"]').type('SenhaErrada1')
    cy.contains('button', 'Entrar').click()

    cy.contains('E-mail ou senha inválidos.').should('be.visible')
  })
})