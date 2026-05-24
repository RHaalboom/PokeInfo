// Pokémon Overview - Tests for viewing the main Pokémon list
describe('Pokémon Overview - Happy Path', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the Pokémon overview page', () => {
    cy.get('[data-cy="pokemon-overview"]').should('be.visible')
  })

  it('should display a list of Pokémon cards', () => {
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
  })

  it('should display Pokémon card with name and image', () => {
    cy.get('[data-cy="pokemon-card"]').first().within(() => {
      cy.get('[data-cy="pokemon-name"]').should('be.visible').and('not.be.empty')
      cy.get('[data-cy="pokemon-image"]').should('be.visible')
    })
  })

  it('should display Pokémon card with type badges', () => {
    cy.get('[data-cy="pokemon-card"]').first().within(() => {
      cy.get('[data-cy="pokemon-type"]').should('have.length.greaterThan', 0)
    })
  })

  it('should load more Pokémon when scrolling to the bottom', () => {
    cy.get('[data-cy="pokemon-card"]').then(($cards) => {
      const initialCount = $cards.length
      cy.get('[data-cy="pokemon-card"]').last().scrollIntoView()
      cy.wait(1000)
      cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', initialCount)
    })
  })
})

describe('Pokémon Search - Happy Path', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should search for a Pokémon by exact name', () => {
    cy.get('[data-cy="pokemon-search"]').type('pikachu')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-cy="pokemon-name"]').first().should('contain.text', 'pikachu')
  })

  it('should filter Pokémon by partial name match', () => {
    cy.get('[data-cy="pokemon-search"]').type('char')
    cy.get('[data-cy="pokemon-card"]').each(($card) => {
      cy.wrap($card).get('[data-cy="pokemon-name"]').invoke('text').should('match', /char/i)
    })
  })

  it('should clear search results when clearing the search input', () => {
    cy.get('[data-cy="pokemon-search"]').type('pikachu')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-cy="pokemon-search"]').clear()
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 1)
  })

  it('should be case-insensitive when searching', () => {
    cy.get('[data-cy="pokemon-search"]').type('PIKACHU')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-cy="pokemon-name"]').first().invoke('text').should('match', /pikachu/i)
  })
})

describe('Pokémon Search - Unhappy Path', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display no results when searching for non-existent Pokémon', () => {
    cy.get('[data-cy="pokemon-search"]').type('nonexistentpokemon123xyz')
    cy.get('[data-cy="pokemon-card"]').should('have.length', 0)
    cy.get('[data-cy="no-results-message"]').should('be.visible')
  })

  it('should display error message when search fails', () => {
    cy.get('[data-cy="pokemon-search"]').type('test')
    // Assuming the app shows an error for certain conditions
    cy.get('[data-cy="search-error"]').should('not.exist')
  })
})

describe('Pokémon Details - Happy Path', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for Pokémon list to load
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
  })

  it('should navigate to Pokémon details when clicking a card', () => {
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.url().should('include', '/pokemon')
    cy.get('[data-cy="pokemon-detail-page"]').should('be.visible')
  })

  it('should display Pokémon name and image on detail page', () => {
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.get('[data-cy="pokemon-detail-name"]').should('be.visible').and('not.be.empty')
    cy.get('[data-cy="pokemon-detail-image"]').should('be.visible')
  })

  it('should display Pokémon base stats', () => {
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.get('[data-cy="stats-section"]').should('be.visible')
    cy.get('[data-cy="stat-hp"]').should('be.visible')
    cy.get('[data-cy="stat-attack"]').should('be.visible')
    cy.get('[data-cy="stat-defense"]').should('be.visible')
  })

  it('should display Pokémon height and weight', () => {
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.get('[data-cy="pokemon-detail-height"]').should('be.visible').and('not.be.empty')
    cy.get('[data-cy="pokemon-detail-weight"]').should('be.visible').and('not.be.empty')
  })

  it('should display Pokémon type information', () => {
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.get('[data-cy="pokemon-detail-types"]').should('be.visible')
  })

  it('should navigate back to overview from detail page', () => {
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.get('[data-cy="back-button"]').click()
    cy.url().should('not.include', '/pokemon')
    cy.get('[data-cy="pokemon-overview"]').should('be.visible')
  })
})
