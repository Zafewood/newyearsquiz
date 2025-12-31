// Game data - will be loaded from JSON
let gameData = null;

// Game state
let gameState = {
    usedTiles: []
};

// Load game data from JSON file
async function loadGameData() {
    try {
        const response = await fetch('questions.json');
        gameData = await response.json();
    } catch (error) {
        console.error('Error loading questions:', error);
        // Fallback data if JSON fails to load
        gameData = {
            categories: []
        };
    }
}

// Initialize game
async function initGame() {
    await loadGameData();
    loadGameState();
    renderBoard();
    setupEventListeners();
}

// Load game state from local storage
function loadGameState() {
    const saved = localStorage.getItem('jeopardyGameState');
    if (saved) {
        gameState = JSON.parse(saved);
    }
}

// Save game state to local storage
function saveGameState() {
    localStorage.setItem('jeopardyGameState', JSON.stringify(gameState));
}

// Render the game board
function renderBoard() {
    const board = document.querySelector('.board');
    board.innerHTML = '';
    
    // Create 4 rows (point levels)
    for (let row = 0; row < 4; row++) {
        // Create 5 columns (categories)
        for (let col = 0; col < 5; col++) {
            const points = (row + 1) * 10;
            const tileId = `${col}-${row}`;
            const isUsed = gameState.usedTiles.includes(tileId);
            
            const tile = document.createElement('div');
            tile.className = `tile ${isUsed ? 'used' : ''}`;
            tile.dataset.category = col;
            tile.dataset.level = row;
            tile.dataset.tileId = tileId;
            
            tile.innerHTML = `<span class="point-value">${points}</span>`;
            
            if (!isUsed) {
                tile.addEventListener('click', handleTileClick);
            }
            
            board.appendChild(tile);
        }
    }
}

// Handle tile click
function handleTileClick(event) {
    const tile = event.currentTarget;
    const category = parseInt(tile.dataset.category);
    const level = parseInt(tile.dataset.level);
    const tileId = tile.dataset.tileId;
    
    // Mark tile as used
    if (!gameState.usedTiles.includes(tileId)) {
        gameState.usedTiles.push(tileId);
        saveGameState();
    }
    
    // Show question
    showQuestion(category, level);
}

// Show question view
function showQuestion(category, level) {
    if (!gameData || !gameData.categories || !gameData.categories[category]) {
        console.error('Game data not loaded');
        return;
    }
    
    const question = gameData.categories[category].questions[level];
    const categoryName = gameData.categories[category].name;
    
    // Update question view
    document.querySelector('.category-name').textContent = categoryName;
    document.querySelector('.question-header .point-value').textContent = question.points;
    document.getElementById('question-text').textContent = question.text;
    
    // Switch views
    document.getElementById('board-view').classList.remove('active');
    document.getElementById('question-view').classList.add('active');
}

// Show board view
function showBoard() {
    document.getElementById('question-view').classList.remove('active');
    document.getElementById('board-view').classList.add('active');
    renderBoard(); // Re-render to update used tiles
}

// Reset game
function resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
        gameState.usedTiles = [];
        saveGameState();
        renderBoard();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Back button
    document.getElementById('back-btn').addEventListener('click', showBoard);
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetGame);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

