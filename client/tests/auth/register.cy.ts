import { mockAuth, mockAddUser } from '../support/mocks'

describe('Cadastro de usuário (frontend)', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    mockAuth()
    cy.visit('/auth/register')
  })

  it('exibe o formulário de cadastro', () => {
    cy.contains('Criar conta').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('have.length', 2)
    cy.contains('button', 'Criar conta').should('be.visible')
  })

  it('valida senhas divergentes', () => {
    cy.get('input[type="email"]').type('teste@exemplo.com')
    cy.get('input[type="password"]').first().type('Senha123')
    cy.get('input[type="password"]').eq(1).type('Senha456')
    cy.contains('button', 'Criar conta').click()
    cy.contains('As senhas não coincidem.').should('be.visible')
  })

  it('cadastra um usuário novo e redireciona para o login', () => {
    const email = `cypress-${Date.now()}@teste.com`
    const password = 'Teste123'

    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').first().type(password)
    cy.get('input[type="password"]').eq(1).type(password)
    cy.contains('button', 'Criar conta').click()

    cy.url().should('include', '/auth/login')
    cy.contains('Entrar').should('be.visible')
  })

  it('mostra erro ao tentar cadastrar e-mail já existente', () => {
    const email = `cypress-existente-${Date.now()}@teste.com`
    const password = 'Teste123'

    mockAddUser(email, password)

    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').first().type(password)
    cy.get('input[type="password"]').eq(1).type(password)
    cy.contains('button', 'Criar conta').click()

    cy.contains('Já existe uma conta cadastrada com esse e-mail.').should('be.visible')
  })
})