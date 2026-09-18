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

export interface MockElement {
  id: string
  content: string
}

export interface MockListState {
  id: string
  name: string
  version: number
  elements: MockElement[]
  createdAt: string
  updatedAt: string
}

let lists: MockListState[] = []
let listCounter = 1

export function mockReset() {
  store = []
  idCounter = 1
  lists = []
  listCounter = 1
}

let mockUuidCounter = 1
function mockUuid(): string {
  const seed = `00000000-0000-4000-8000-${String(mockUuidCounter++).padStart(12, '0')}`
  return seed
}

export function mockAddList(
  name = 'Lista teste',
  elements: string[] = [],
): MockListState {
  const list: MockListState = {
    id: mockUuid(),
    name,
    version: 1,
    elements: elements.map((content) => ({
      id: mockUuid(),
      content,
    })),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
  lists.push(list)
  return list
}

function mockListSummary(list: MockListState) {
  return {
    id: list.id,
    name: list.name,
    version: list.version,
    elementCount: list.elements.length,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }
}

const CHANGE_TYPE_LABEL: Record<string, string> = {
  CREATE: 'Lista criada.',
  ADD: 'Elemento adicionado.',
  EDIT: 'Elemento editado.',
  REMOVE: 'Elemento removido.',
  REORDER: 'Elemento reordenado.',
  RENAME: 'Lista renomeada.',
  RESTORE: 'Lista restaurada.',
}

function mockCommit(list: MockListState, changeType: string) {
  list.version += 1
  list.updatedAt = new Date().toISOString()
  return {
    version: list.version,
    changeType,
  }
}

function notFound(message: string) {
  return { statusCode: 404, message }
}

export function mockLists() {
  cy.intercept('GET', '**/lists', (req) => {
    req.reply({
      statusCode: 200,
      body: lists.map(mockListSummary),
    })
  })

  cy.intercept('POST', '**/lists', (req) => {
    const { name, elements } = req.body as { name: string; elements?: string[] }
    const list = mockAddList(name, elements ?? [])
    req.reply({ statusCode: 201, body: list })
  })

  cy.intercept('GET', '**/lists/*', (req) => {
    const list = lists.find((item) => item.id === req.url.split('/').pop())
    if (!list) {
      req.reply(notFound('Lista não encontrada.'))
      return
    }
    req.reply({ statusCode: 200, body: list })
  })

  cy.intercept('PATCH', '**/lists/*', (req) => {
    const id = req.url.split('/').pop()!
    const list = lists.find((item) => item.id === id)
    if (!list) {
      req.reply(notFound('Lista não encontrada.'))
      return
    }
    const { name } = req.body as { name?: string }
    if (name !== undefined) {
      list.name = name
    }
    mockCommit(list, 'RENAME')
    req.reply({ statusCode: 200, body: list })
  })

  cy.intercept('DELETE', '**/lists/*', (req) => {
    const id = req.url.split('/').pop()!
    const before = lists.length
    lists = lists.filter((item) => item.id !== id)
    if (lists.length === before) {
      req.reply(notFound('Lista não encontrada.'))
      return
    }
    req.reply({ statusCode: 200, body: true })
  })

  cy.intercept('POST', '**/lists/*/elements', (req) => {
    const segments = req.url.split('/')
    const id = segments[segments.length - 2]
    const list = lists.find((item) => item.id === id)
    if (!list) {
      req.reply(notFound('Lista não encontrada.'))
      return
    }
    const { content } = req.body as { content: string }
    const added = { id: mockUuid(), content }
    list.elements = [...list.elements, added]
    mockCommit(list, 'ADD')
    req.reply({
      statusCode: 201,
      body: { version: list.version, elements: list.elements, added },
    })
  })

  cy.intercept('PATCH', '**/lists/*/elements/*', (req) => {
    const segments = req.url.split('/')
    const listId = segments[segments.length - 3]
    const elementId = segments[segments.length - 1]
    const list = lists.find((item) => item.id === listId)
    if (!list) {
      req.reply(notFound('Lista não encontrada.'))
      return
    }
    const element = list.elements.find((item) => item.id === elementId)
    if (!element) {
      req.reply(notFound('Elemento não encontrado.'))
      return
    }
    const { content } = req.body as { content: string }
    const edited = { ...element, content }
    list.elements = list.elements.map((item) =>
      item.id === elementId ? edited : item,
    )
    mockCommit(list, 'EDIT')
    req.reply({
      statusCode: 200,
      body: { version: list.version, elements: list.elements, edited },
    })
  })

  cy.intercept('DELETE', '**/lists/*/elements/*', (req) => {
    const segments = req.url.split('/')
    const listId = segments[segments.length - 3]
    const elementId = segments[segments.length - 1]
    const list = lists.find((item) => item.id === listId)
    if (!list) {
      req.reply(notFound('Lista não encontrada.'))
      return
    }
    const removed = list.elements.find((item) => item.id === elementId)
    if (!removed) {
      req.reply(notFound('Elemento não encontrado.'))
      return
    }
    list.elements = list.elements.filter((item) => item.id !== elementId)
    mockCommit(list, 'REMOVE')
    req.reply({
      statusCode: 200,
      body: { version: list.version, elements: list.elements, removed },
    })
  })

  cy.intercept('PUT', '**/lists/*/elements/*/reorder', (req) => {
    const segments = req.url.split('/')
    const listId = segments[segments.length - 4]
    const elementId = segments[segments.length - 2]
    const list = lists.find((item) => item.id === listId)
    if (!list) {
      req.reply(notFound('Lista não encontrada.'))
      return
    }
    const index = list.elements.findIndex((item) => item.id === elementId)
    if (index === -1) {
      req.reply(notFound('Elemento não encontrado na lista.'))
      return
    }
    const { newPosition } = req.body as { newPosition: number }
    const elements = [...list.elements]
    const [moved] = elements.splice(index, 1)
    if (newPosition < 0 || newPosition > elements.length) {
      req.reply({
        statusCode: 400,
        message: `Posição inválida. A posição deve estar entre 0 e ${elements.length} (após a remoção do elemento).`,
      })
      return
    }
    elements.splice(newPosition, 0, moved)
    list.elements = elements
    mockCommit(list, 'REORDER')
    req.reply({
      statusCode: 200,
      body: { version: list.version, elements: list.elements, moved },
    })
  })

  cy.intercept('GET', '**/lists/*/history', (req) => {
    const segments = req.url.split('/')
    const id = segments[segments.length - 2]
    const list = lists.find((item) => item.id === id)
    if (!list) {
      req.reply(notFound('Lista não encontrada.'))
      return
    }
    req.reply({
      statusCode: 200,
      body: {
        listId: list.id,
        currentVersion: list.version,
        versions: Array.from({ length: list.version }, (_, index) => ({
          versionNumber: index + 1,
          changeType: index === 0 ? 'CREATE' : 'EDIT',
          description: index === 0 ? CHANGE_TYPE_LABEL.CREATE : null,
          createdAt: '2026-01-01T00:00:00.000Z',
          elementCount: list.elements.length,
        })),
      },
    })
  })

  cy.intercept('POST', '**/lists/*/restore/*', (req) => {
    const segments = req.url.split('/')
    const id = segments[segments.length - 3]
    const versionNumber = Number(segments[segments.length - 1])
    const list = lists.find((item) => item.id === id)
    if (!list) {
      req.reply(notFound('Lista não encontrada.'))
      return
    }
    mockCommit(list, 'RESTORE')
    req.reply({
      statusCode: 201,
      body: {
        version: list.version,
        restoredFromVersion: versionNumber,
        elements: list.elements,
      },
    })
  })
}