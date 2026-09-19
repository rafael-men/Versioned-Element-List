# Lista Versionada

Aplicação web para operação de listas de elementos, com edição, reordenação e histórico acessível e refatorável de versões.

## Tecnologias

- Frontend: React, TypeScript, Vite e Tailwind CSS.
- Backend: NestJS, TypeScript e TypeORM.
- Banco de dados: MySQL 8.
- Testes: Jest, Supertest e Cypress.

## Pré-requisitos

- Node.js 22 ou superior.
- npm.
- Docker e Docker Compose.

## Configuração

Crie o arquivo `server/.env` com as variáveis abaixo. Use valores próprios para senhas e segredo JWT:

```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
DB_HOST=mysql
DB_PORT=3306
DB_USER=lista_app
DB_PASSWORD=defina-uma-senha
DB_NAME=lista_versionada
MYSQL_ROOT_PASSWORD=defina-uma-senha-root
MYSQL_DATABASE=lista_versionada
MYSQL_USER=lista_app
MYSQL_PASSWORD=defina-uma-senha
JWT_SECRET=defina-um-segredo-longo-e-aleatorio
JWT_EXPIRES_IN=604800
```

O arquivo `.env` não deve ser incluído no ZIP de entrega. Não use credenciais reais em arquivos versionados.

## Executar com Docker

Na raiz do projeto:

```bash
docker compose up --build -d
```

O MySQL ficará disponível na porta `3306` e a API na porta `4000`.

Para acompanhar os logs:

```bash
docker compose logs -f api
```

Para parar os serviços:

```bash
docker compose down
```

O volume `mysql_data` preserva os dados entre reinicializações.

## Executar em desenvolvimento

Backend:

```bash
cd server
npm install
npm run start:dev
```

Frontend, em outro terminal:

```bash
cd client
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173` e usará a API em `http://localhost:4000` por padrão. Para alterar a API, defina `VITE_API_BASE_URL` no ambiente do frontend.

## Funcionalidades

- Cadastro e login de usuários.
- Criação e exclusão de listas.
- Renomeação de listas.
- Adição de elementos.
- Edição de elementos existentes.
- Remoção de elementos.
- Reordenação por drag and drop, setas ou seleção de posição.
- Consulta do histórico de versões, com o tipo de mudança traduzido e a descrição legível de cada versão.
- Visualização da organização dos elementos em uma versão.
- Restauração de uma versão anterior.

Cada alteração cria um snapshot completo da lista e uma nova versão com um dos oito tipos de mudança (`CREATE`, `ADD`, `EDIT`, `REMOVE`, `REORDER`, `RENAME`, `REPLACE`, `RESTORE`). Ao restaurar uma versão, o estado escolhido é copiado para uma nova versão marcada como `RESTORE` e as versões anteriores são preservadas.

Além da interface, a API também expõe:

- Substituição total da lista (nome + todos os elementos) em uma única operação (`PUT /lists/:id`, versão `REPLACE`).
- Edição em lote de vários elementos numa única requisição (`PATCH /lists/:id`, gera uma única versão `EDIT`).
- Consulta de uma versão específica (`GET /lists/:id/versions/:n`).
- Documentação interativa (Swagger) em `http://localhost:4000/api-docs`.

## Segurança

- Senhas armazenadas com `scrypt` + salt aleatório (16 bytes) e comparação em tempo constante.
- Autenticação via JWT com expiração configurável (`JWT_EXPIRES_IN`, padrão de 7 dias).
- Política de senha forte: mínimo de 6 caracteres, com pelo menos um número, uma letra maiúscula e uma minúscula.
- E-mail normalizado (removidos espaços e convertido para minúsculas) no cadastro e no login.
- Sanitização de texto anti-XSS em todas as entradas: remoção de espaços nas pontas, rejeição de caracteres de controle e escape de HTML.
- Helmet com CSP restrita, CORS com origem única configurável e credenciais, e autorização por proprietário (listas de outros usuários retornam `404`).

## Arquitetura

O backend é organizado em Clean Architecture:

- `application`: controllers, DTOs e casos de uso.
- `domain`: entidades, modelos e enums de negócio.
- `use-cases`: regras de negócio e portas de repositório.
- `infrastructure`: TypeORM, MySQL, autenticação, configuração e middlewares.

O frontend usa componentes React, páginas de autenticação, componentes de interface e um contexto de API/autenticação para centralizar as chamadas HTTP.

## Persistência e versionamento

As tabelas principais são:

- `users`: usuários autenticados.
- `element_lists`: nome, proprietário e versão atual da lista.
- `list_versions`: snapshots JSON dos elementos, tipo da mudança, descrição e data.

Cada operação de alteração cria um novo registro em `list_versions`, com uma descrição legível gerada automaticamente (por exemplo: "Elemento adicionado: ...", "Elemento movido para a posição ..." ou "Restaurada a partir da versão ..."). A versão atual aponta para o maior número de versão, e a restauração cria outro snapshot sem apagar o histórico anterior.

Limitações de entrada: nome da lista com até 120 caracteres, conteúdo de elemento com até 2000 caracteres e no máximo 500 elementos por lista; a posição de reordenação é validada dentro dos limites do array.

## Testes

Backend unitário:

```bash
cd server
npm test
```

Backend end-to-end:

```bash
cd server
npm run test:e2e
```

Os testes e2e precisam de um banco MySQL disponível e das variáveis definidas em `server/.env`.

Cobertura:

```bash
cd server
npm run test:cov
```

Frontend:

```bash
cd client
npm run build
npm run lint
npm run test:e2e
```

Para executar o Cypress em modo interativo, inicie o frontend e use `npm run test:e2e:open` dentro de `client`.

## Decisões e limitações

- Os snapshots completos simplificam a consulta e a restauração, ao custo de armazenar o estado inteiro a cada alteração.
- O TypeORM está configurado com `synchronize: true` para facilitar o desenvolvimento.
- O frontend depende do backend e do banco para carregar listas e históricos.
- A configuração padrão usa `localhost`; em ambientes diferentes, ajuste `CORS_ORIGIN`, `VITE_API_BASE_URL` e as variáveis do banco.
