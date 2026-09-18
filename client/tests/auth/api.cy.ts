import { randomEmail, randomPassword } from '../utils'
import { mockAuth, mockAddUser, mockLists } from '../support/mocks'

describe('API de autenticação (mockada)', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    mockAuth()
    mockLists()
  })

  it('registra um usuário (201) e devolve o usuário público na resposta interceptada', () => {
    const email = randomEmail()
    const password = randomPassword()

    cy.intercept('POST', '**/auth/register').as('register')
    cy.visit('/auth/register')

    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').first().type(password)
    cy.get('input[type="password"]').eq(1).type(password)
    cy.contains('button', 'Criar conta').click()

    cy.wait('@register')
      .its('response')
      .then((response) => {
        expect(response.statusCode).to.eq(201)
        expect(response.body).to.have.property('id')
        expect(response.body).to.have.property('email').eq(email)
        expect(response.body).to.have.property('createdAt')
      })
  })

  it('rejeita e-mail duplicado com 409', () => {
    const email = randomEmail()
    const password = randomPassword()
    mockAddUser(email, password)

    cy.intercept('POST', '**/auth/register').as('register')
    cy.visit('/auth/register')

    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').first().type(password)
    cy.get('input[type="password"]').eq(1).type(password)
    cy.contains('button', 'Criar conta').click()

    cy.wait('@register')
      .its('response')
      .then((response) => {
        expect(response.statusCode).to.eq(409)
        expect(response.body.message).to.contain('Já existe uma conta')
      })
  })

  it('faz login e retorna um token JWT', () => {
    const email = randomEmail()
    const password = randomPassword()
    mockAddUser(email, password)

    cy.intercept('POST', '**/auth/login').as('login')
    cy.visit('/auth/login')

    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.contains('button', 'Entrar').click()

    cy.wait('@login')
      .its('response')
      .then((response) => {
        expect(response.statusCode).to.be.oneOf([201, 200])
        expect(response.body.token).to.be.a('string').and.not.be.empty
        expect(response.body.user.email).to.eq(email)
      })
  })

  it('rejeita credenciais inválidas com 401', () => {
    cy.intercept('POST', '**/auth/login').as('login')
    cy.visit('/auth/login')

    cy.get('input[type="email"]').type(randomEmail())
    cy.get('input[type="password"]').type('SenhaErrada1')
    cy.contains('button', 'Entrar').click()

    cy.wait('@login')
      .its('response')
      .then((response) => {
        expect(response.statusCode).to.eq(401)
        expect(response.body.message).to.contain('E-mail ou senha inválidos')
      })
  })
})