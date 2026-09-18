import { mockAuth, mockLists, mockAddList, MOCK_TOKEN } from './support/mocks'

describe('Home — listas versionadas (mockada)', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    mockAuth()
    mockLists()
    cy.window().then((window) => {
      window.localStorage.setItem('vel_token', MOCK_TOKEN)
    })
    cy.visit('/')
  })

  it('exibe coleção vazia  para criar a primeira lista', () => {
    cy.contains('Minhas listas').should('be.visible')
    cy.contains('Você ainda não tem listas').should('be.visible')
    cy.contains('button', 'Nova lista').should('be.visible')
  })

  it('cria uma lista com elementos iniciais', () => {
    cy.contains('button', 'Nova lista').click()

    cy.get('#list-name').type('Compras do mês')
    cy.get('#list-elements').type('Leite\nPão\nOvos')
    cy.contains('button', 'Criar lista').click()

    cy.contains('Compras do mês').should('be.visible')
    cy.contains('3 elemento(s)').should('be.visible')
  })

  it('abre uma lista e adiciona um elemento', () => {
    mockAddList('Projeto', ['Iniciar', 'Revisar'])

    cy.contains('Projeto').click()

    cy.contains('Iniciar').should('be.visible')
    cy.contains('Revisar').should('be.visible')

    cy.get('[data-testid="new-element"]').type('Finalizar')
    cy.contains('button', 'Adicionar').click()

    cy.contains('Finalizar').should('be.visible')
    cy.contains('3 elemento(s)').should('be.visible')
  })

  it('reordena por drag and drop', () => {
    mockAddList('DnD', ['Alfa', 'Beta', 'Gama'])

    cy.contains('DnD').click()

    cy.contains('li', 'Alfa').should('be.visible')

    cy.get('li').contains('Alfa').trigger('dragstart', {
      dataTransfer: new DataTransfer(),
      force: true,
    })
    cy.get('li').contains('Gama').then(($target) => {
      const rect = $target[0].getBoundingClientRect()
      cy.get('li').contains('Gama').trigger('dragover', {
        dataTransfer: new DataTransfer(),
        clientY: rect.bottom - 2,
        force: true,
      })
    })
    cy.get('li').contains('Gama').trigger('drop', {
      dataTransfer: new DataTransfer(),
      force: true,
    })

    cy.get('li').eq(0).should('contain', 'Beta')
    cy.get('li').eq(1).should('contain', 'Gama')
    cy.get('li').eq(2).should('contain', 'Alfa')
  })

  it('reordena com botões de mover', () => {
    mockAddList('Setas', ['Um', 'Dois', 'Três'])

    cy.contains('Setas').click()

    cy.get('li').contains('Um').find('[aria-label="Mover para baixo"]').click()

    cy.get('li').eq(0).should('contain', 'Dois')
    cy.get('li').eq(1).should('contain', 'Um')
    cy.get('li').eq(2).should('contain', 'Três')

    cy.get('li').contains('Três').find('[aria-label="Mover para cima"]').click()

    cy.get('li').eq(0).should('contain', 'Três')
    cy.get('li').eq(1).should('contain', 'Dois')
    cy.get('li').eq(2).should('contain', 'Um')
  })

  it('reordena pela seleção manual da posição', () => {
    mockAddList('Posições', ['X', 'Y', 'Z'])

    cy.contains('Posições').click()

    cy.get('li').contains('X').find('[aria-label="Selecionar posição"]').click()
    cy.get('[role="option"]').contains('3').click()

    cy.get('li').eq(0).should('contain', 'Y')
    cy.get('li').eq(1).should('contain', 'Z')
    cy.get('li').eq(2).should('contain', 'X')
  })

  it('exclui uma lista', () => {
    mockAddList('Lixo', ['Item'])

    cy.contains('Lixo').click()
    cy.contains('button', 'Excluir').first().click()
    cy.contains('button', 'Excluir').last().click()

    cy.contains('Você ainda não tem listas').should('be.visible')
  })
})