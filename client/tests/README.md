# Cypress — Testes E2E de autenticação (mockados)

Os testes em `tests/` validam o fluxo completo de autenticação do frontend React (shadcn). As chamadas à API NestJS são **mockadas via `cy.intercept`** — nenhum banco de dados ou servidor backend é necessário para executá-los.

## Pré-requisitos

- Apenas o **frontend** precisa estar rodando:

  ```bash
  cd client
  npm run dev   # http://localhost:5173
  ```

## Executando

```bash
npm run test:e2e          # roda headless
npm run test:e2e:open     # abre o Cypress Test Runner (interativo)
```

## Estrutura

```
tests/
├── cypress.d.ts
├── utils.ts
├── support/
│   ├── e2e.ts          # beforeEach: mockReset()
│   └── mocks.ts        # mockAuth(), mockAddUser(), mockLoginBody(), MOCK_TOKEN
└── auth/
    ├── api.cy.ts        # register 201, 409 duplicado, login com token, 401
    ├── login.cy.ts      # formulário, token em localStorage, erro 401
    ├── register.cy.ts   # formulário, senhas divergentes, redirect, 409
    └── guard.cy.ts      # RequireGuest / RequireAuth
```

### Como funcionam os mocks

- `mockAuth()` — intercepta `POST /auth/register` e `POST /auth/login`, simulando um banco em memória via `mockAddUser(email, password)`.
- `mockAddUser(email, password)` — registra um usuário no store em memória, sem nenhum request real.
- `MOCK_TOKEN` — token JWT fake para testes de guarda (inserido direto no `localStorage`).
- `mockReset()` — limpa o store antes de cada teste (chamado automaticamente via `beforeEach` em `e2e.ts`).

> Os emails gerados são únicos por execução (`cypress-<timestamp>@teste.com`), então os testes podem rodar quantas vezes forem necessárias.
