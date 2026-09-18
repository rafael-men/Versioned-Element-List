# Cypress — Testes E2E de autenticação

Os testes em `tests/auth/` cobrem **apenas o mecanismo de autenticação do frontend React**: guardas de rotas, persistência de sessão em `localStorage`, login, cadastro, logout e envio do token no header `Authorization`. As chamadas à API NestJS são **mockadas via `cy.intercept`** — nenhum banco de dados ou servidor backend é necessário para executá-los.

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

O `specPattern` está limitado a `tests/auth/**/*.cy.ts`.

## Estrutura

```
tests/
├── cypress.d.ts
├── utils.ts
├── support/
│   ├── e2e.ts          # beforeEach: mockReset()
│   └── mocks.ts        # mockAuth(), mockAuthenticatedLists(), mockAddUser(), MOCK_TOKEN
└── auth/
    ├── api.cy.ts        # register 201, 409 duplicado, login com token, 401
    ├── guard.cy.ts      # RequireGuest / RequireAuth + token no header Authorization
    ├── login.cy.ts      # formulário, token+usuário em localStorage, erro 401
    ├── logout.cy.ts     # limpa a sessão e redireciona para o login
    └── register.cy.ts   # formulário, senhas divergentes, redirect, 409
```

### Como funcionam os mocks

- `mockAuth()` — intercepta `POST /auth/register` e `POST /auth/login`, simulando um banco em memória via `mockAddUser(email, password)`.
- `mockAuthenticatedLists()` — intercepta `GET /lists` para a Home renderizar após o login **e verifica** que a requisição autenticada envia `Authorization: Bearer <token>`.
- `mockAddUser(email, password)` — registra um usuário no store em memória, sem nenhum request real.
- `MOCK_TOKEN` — token JWT fake para testes de guarda e logout (inserido direto no `localStorage`).
- `mockReset()` — limpa o store antes de cada teste (chamado automaticamente via `beforeEach` em `e2e.ts`).

> Os emails gerados são únicos por execução (`cypress-<timestamp>@teste.com`), então os testes podem rodar quantas vezes forem necessárias.