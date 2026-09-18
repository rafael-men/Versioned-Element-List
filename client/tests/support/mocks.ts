export interface Account {
  email: string
  password: string
}

export interface MockUser {
  id: number
  email: string
  createdAt: string
}

export const MOCK_TOKEN = 'mock-jwt-header.mock-jwt-payload.mock-jwt-signature'

export function mockPublicUser(email: string, id = 99): MockUser {
  return { id, email, createdAt: '2026-01-01T00:00:00.000Z' }
}

export function mockLoginBody(email: string, id = 99) {
  return { token: MOCK_TOKEN, user: mockPublicUser(email, id) }
}

interface StoreUser extends MockUser {
  password: string
}

let store: StoreUser[] = []
let idCounter = 1

export function mockGetUser(email: string): StoreUser | undefined {
  const normalized = email.toLowerCase().trim()
  return store.find((u) => u.email === normalized)
}

export function mockAddUser(email: string, password: string): MockUser {
  const user: StoreUser = {
    id: idCounter++,
    email: email.toLowerCase().trim(),
    password,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
  store.push(user)
  return { id: user.id, email: user.email, createdAt: user.createdAt }
}

export function mockAuth() {
  cy.intercept('POST', '**/auth/register', (req) => {
    const { email, password } = req.body as { email: string; password: string }
    const user = mockGetUser(email)

    if (user) {
      req.reply({
        statusCode: 409,
        body: { message: 'Já existe uma conta cadastrada com esse e-mail.' },
      })
      return
    }

    req.reply({
      statusCode: 201,
      body: mockAddUser(email, password),
    })
  })

  cy.intercept('POST', '**/auth/login', (req) => {
    const { email, password } = req.body as { email: string; password: string }
    const user = mockGetUser(email)

    if (!user || user.password !== password) {
      req.reply({
        statusCode: 401,
        body: { message: 'E-mail ou senha inválidos.' },
      })
      return
    }

    req.reply({
      statusCode: 201,
      body: mockLoginBody(user.email, user.id),
    })
  })
}

export function mockAuthenticatedLists(token = MOCK_TOKEN) {
  cy.intercept('GET', '**/lists', (req) => {
    expect(req.headers.authorization).to.equal(`Bearer ${token}`)
    req.reply({ statusCode: 200, body: [] })
  })
}

export function mockReset() {
  store = []
  idCounter = 1
}