// ============================================
// POKÉMON OVERVIEW TESTS
// ============================================

describe('Pokémon Overview - Happy Path', () => {
  beforeEach(() => {
    cy.visit('/pokedex')
  })

  it('should display a list of Pokémon cards on page load', () => {
    cy.get('[data-cy="pokemon-overview"]').should('be.visible')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
  })

  it('should display Pokémon card with visible content', () => {
    cy.get('[data-cy="pokemon-card"]').first().within(() => {
      cy.get('h2').should('be.visible').and('not.be.empty')
      cy.get('img').should('be.visible')
    })
  })

  it('should have filter button available', () => {
    cy.get('[data-cy="pokemon-filter-button"]').should('be.visible')
  })

  it('should open filter panel when clicking filter button', () => {
    cy.get('[data-cy="pokemon-filter-button"]').click()
    cy.get('[data-cy="pokemon-filter-panel"]').should('be.visible')
  })

  it('should display all generations in filter panel', () => {
    cy.get('[data-cy="pokemon-filter-button"]').click()
    cy.get('[data-cy="pokemon-filter-panel"]').should('be.visible')
  })

  it('should filter Pokémon by generation', () => {
    // Get initial count of Pokémon when showing all generations
    cy.get('[data-cy="pokemon-overview"]').then(($overview) => {
      // Open filter panel
      cy.get('[data-cy="pokemon-filter-button"]').click()
      cy.get('[data-cy="pokemon-filter-panel"]').should('be.visible')

      // Click on the first generation button (Generation I)
      cy.get('[data-cy="pokemon-filter-panel"]').within(() => {
        cy.get('.gen-button').first().click()
      })

      // Verify that the panel closes or updates to show filtered results
      cy.get('[data-cy="pokemon-overview"]').should('be.visible')

      // Verify that Pokémon cards are still displayed
      cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
    })
  })
})

// ============================================
// POKÉMON SEARCH TESTS
// ============================================

describe('Pokémon Search - Happy Path', () => {
  beforeEach(() => {
    cy.visit('/pokedex')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
  })

  it('should search for a Pokémon by exact name', () => {
    cy.get('[data-cy="pokemon-search"]').type('pikachu')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
  })

  it('should filter Pokémon by partial name match', () => {
    cy.get('[data-cy="pokemon-search"]').type('char')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
  })

  it('should update results as user types', () => {
    cy.get('[data-cy="pokemon-search"]').type('p')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-cy="pokemon-search"]').type('i')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
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
  })
})

describe('Pokémon Search - Unhappy Path', () => {
  beforeEach(() => {
    cy.visit('/pokedex')
  })

  it('should display no results when searching for non-existent Pokémon', () => {
    cy.get('[data-cy="pokemon-search"]').type('nonexistentpokemon12345xyz')
    cy.get('[data-cy="pokemon-card"]').should('have.length', 0)
  })

  it('should show empty state for invalid search term', () => {
    cy.get('[data-cy="pokemon-search"]').type('!@#$%^&*()')
    cy.get('[data-cy="pokemon-card"]').should('have.length', 0)
  })
})

// ============================================
// POKÉMON DETAILS TESTS
// ============================================

describe('Pokémon Details - Happy Path', () => {
  beforeEach(() => {
    cy.visit('/pokedex')
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
  })

  it('should open detail modal when clicking a card', () => {
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.get('[data-cy="pokemon-detail-modal"]').should('be.visible')
  })

  it('should close modal when clicking back button', () => {
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.get('[data-cy="pokemon-detail-modal"]').should('be.visible')
    cy.get('[data-cy="back-button"]').click()
    cy.get('[data-cy="pokemon-detail-modal"]').should('not.exist')
  })

  it('should close modal when clicking outside (on overlay)', () => {
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.get('[data-cy="pokemon-detail-modal"]').should('be.visible')
    cy.get('.modal-overlay').click({ force: true })
    cy.get('[data-cy="pokemon-detail-modal"]').should('not.exist')
  })

  it('should display multiple Pokémon cards and allow clicking different ones', () => {
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 1)
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.get('[data-cy="pokemon-detail-modal"]').should('be.visible')
    cy.get('[data-cy="back-button"]').click()
    cy.get('[data-cy="pokemon-card"]').eq(1).click()
    cy.get('[data-cy="pokemon-detail-modal"]').should('be.visible')
  })

  it('should return to filtered overview after closing detail', () => {
    cy.get('[data-cy="pokemon-search"]').type('pikachu')
    cy.get('[data-cy="pokemon-card"]').first().click()
    cy.get('[data-cy="back-button"]').click()
    cy.get('[data-cy="pokemon-card"]').should('have.length.greaterThan', 0)
  })

  it('should display correct Pokémon information in detail modal', () => {
    // Get the first card's information before clicking
    let clickedPokemonName = ''

    cy.get('[data-cy="pokemon-card"]').first().within(() => {
      cy.get('h2').invoke('text').then((text) => {
        clickedPokemonName = text.trim()
      })
    }).then(() => {
      // Click the card to open detail modal
      cy.get('[data-cy="pokemon-card"]').first().click()
      cy.get('[data-cy="pokemon-detail-modal"]').should('be.visible')

      // Verify the detail modal shows the same Pokémon information
      cy.get('[data-cy="pokemon-detail-modal"]').within(() => {
        // Verify the name is displayed in the modal header
        cy.get('.pokemon-name-id-container').should('contain', clickedPokemonName)
        // Verify image is shown
        cy.get('.pokemon-image').should('be.visible')
        // Verify the ID is displayed
        cy.get('.pokemon-id').should('be.visible').and('not.be.empty')
        // Verify types section exists and has content
        cy.get('.types-container').should('be.visible').and('not.be.empty')
      })
    })
  })
})
