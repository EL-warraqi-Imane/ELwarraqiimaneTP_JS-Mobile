let playerPokemon = null;
let enemyPokemon = null;
let gameState = 'selection';

// Recherche d'un Pokémon
async function searchPokemon() {
    const searchInput = document.getElementById('pokemon-search');
    const pokemonName = searchInput.value.toLowerCase().trim();
    
    if (!pokemonName) {
        alert('Veuillez entrer un nom de Pokémon');
        return;
    }

    try {
        const response = await fetch(`/api/pokemon/${pokemonName}`);
        const data = await response.json();
        
        if (response.ok) {
            displayPokemonResult(data);
            playerPokemon = { ...data, currentHp: data.hp };
            document.getElementById('start-game').disabled = false;
        } else {
            alert('Pokémon non trouvé. Essayez un autre nom.');
        }
    } catch (error) {
        alert('Erreur lors de la recherche du Pokémon');
    }
}

// Affichage du résultat de recherche
function displayPokemonResult(pokemon) {
    const resultDiv = document.getElementById('pokemon-result');
    resultDiv.innerHTML = `
        <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        <img src="${pokemon.sprite}" alt="${pokemon.name}">
        <p>PV: ${pokemon.hp}</p>
        <div class="moves">
            <h4>Attaques :</h4>
            ${pokemon.moves.map(move => `
                <div class="move">
                    <strong>${move.name}</strong> - 
                    Puissance: ${move.power} | 
                    Précision: ${move.accuracy} | 
                    PP: ${move.pp}
                </div>
            `).join('')}
        </div>
    `;
}

// Démarrage du jeu
async function startGame() {
    if (!playerPokemon) {
        alert('Veuillez d\'abord choisir un Pokémon');
        return;
    }

    try {
        // Récupérer un Pokémon aléatoire pour l'ennemi
        const response = await fetch('/api/random-pokemon');
        enemyPokemon = { ...await response.json(), currentHp: 300 };
        
        // Initialiser les PP des attaques
        playerPokemon.moves.forEach(move => move.currentPp = move.pp);
        enemyPokemon.moves.forEach(move => move.currentPp = move.pp);
        
        // Afficher l'écran de combat
        showBattleScreen();
        addToLog('Le combat commence!', 'info');
    } catch (error) {
        alert('Erreur lors du démarrage du jeu');
    }
}

// Affichage de l'écran de combat
function showBattleScreen() {
    document.getElementById('selection-screen').classList.remove('active');
    document.getElementById('battle-screen').classList.add('active');
    
    // Mettre à jour l'affichage des Pokémon
    updatePokemonDisplay();
    
    // Afficher les attaques du joueur
    displayPlayerMoves();
}

// Mise à jour de l'affichage des Pokémon
function updatePokemonDisplay() {
    // Pokémon joueur
    document.getElementById('player-name').textContent = 
        playerPokemon.name.charAt(0).toUpperCase() + playerPokemon.name.slice(1);
    document.getElementById('player-sprite').src = playerPokemon.sprite;
    document.getElementById('player-hp').textContent = 
        `${playerPokemon.currentHp}/${playerPokemon.hp} PV`;
    
    const playerHealthBar = document.getElementById('player-health');
    playerHealthBar.style.width = `${(playerPokemon.currentHp / playerPokemon.hp) * 100}%`;
    
    // Pokémon ennemi
    document.getElementById('enemy-name').textContent = 
        enemyPokemon.name.charAt(0).toUpperCase() + enemyPokemon.name.slice(1);
    document.getElementById('enemy-sprite').src = enemyPokemon.sprite;
    document.getElementById('enemy-hp').textContent = 
        `${enemyPokemon.currentHp}/${enemyPokemon.hp} PV`;
    
    const enemyHealthBar = document.getElementById('enemy-health');
    enemyHealthBar.style.width = `${(enemyPokemon.currentHp / enemyPokemon.hp) * 100}%`;
}

// Affichage des attaques du joueur
function displayPlayerMoves() {
    const movesList = document.getElementById('moves-list');
    movesList.innerHTML = playerPokemon.moves.map((move, index) => `
        <button class="move-btn" onclick="playerAttack(${index})" 
                ${move.currentPp <= 0 ? 'disabled' : ''}>
            <strong>${move.name}</strong>
            <div class="move-info">
                Puissance: ${move.power} | Précision: ${move.accuracy} | 
                PP: ${move.currentPp}/${move.pp}
            </div>
        </button>
    `).join('');
}

// Attaque du joueur
async function playerAttack(moveIndex) {
    const playerMove = playerPokemon.moves[moveIndex];
    
    // Vérifier les PP
    if (playerMove.currentPp <= 0) {
        addToLog(`${playerPokemon.name} n'a plus de PP pour ${playerMove.name}!`, 'info');
        return;
    }
    
    // Décrémenter les PP
    playerMove.currentPp--;
    
    // Vérifier la précision
    const hitChance = Math.random() * 100;
    if (hitChance > playerMove.accuracy) {
        addToLog(`${playerPokemon.name} utilise ${playerMove.name}... mais rate!`, 'player');
    } else {
        // Calcul des dégâts
        const damage = playerMove.power || 10; // Minimum 10 dégâts si pas de puissance
        enemyPokemon.currentHp = Math.max(0, enemyPokemon.currentHp - damage);
        addToLog(`${playerPokemon.name} utilise ${playerMove.name} et inflige ${damage} dégâts!`, 'player');
    }
    
    // Mettre à jour l'affichage
    updatePokemonDisplay();
    displayPlayerMoves();
    
    // Vérifier si l'ennemi est K.O.
    if (enemyPokemon.currentHp <= 0) {
        endGame('player');
        return;
    }
    
    // Attaque de l'ennemi
    setTimeout(enemyAttack, 1000);
}

// Attaque de l'ennemi
function enemyAttack() {
    // Choisir une attaque aléatoire avec des PP
    const availableMoves = enemyPokemon.moves.filter(move => move.currentPp > 0);
    
    if (availableMoves.length === 0) {
        addToLog(`${enemyPokemon.name} n'a plus d'attaques disponibles!`, 'enemy');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    const enemyMove = availableMoves[randomIndex];
    const moveIndex = enemyPokemon.moves.findIndex(m => m.name === enemyMove.name);
    
    // Décrémenter les PP
    enemyPokemon.moves[moveIndex].currentPp--;
    
    // Vérifier la précision
    const hitChance = Math.random() * 100;
    if (hitChance > enemyMove.accuracy) {
        addToLog(`${enemyPokemon.name} utilise ${enemyMove.name}... mais rate!`, 'enemy');
    } else {
        // Calcul des dégâts
        const damage = enemyMove.power || 10;
        playerPokemon.currentHp = Math.max(0, playerPokemon.currentHp - damage);
        addToLog(`${enemyPokemon.name} utilise ${enemyMove.name} et inflige ${damage} dégâts!`, 'enemy');
    }
    
    // Mettre à jour l'affichage
    updatePokemonDisplay();
    
    // Vérifier si le joueur est K.O.
    if (playerPokemon.currentHp <= 0) {
        endGame('enemy');
    }
}

// Fin du jeu
function endGame(winner) {
    if (winner === 'player') {
        addToLog(`Félicitations! ${playerPokemon.name} remporte le combat!`, 'info');
    } else {
        addToLog(`${enemyPokemon.name} remporte le combat! Essayez encore!`, 'info');
    }
    
    // Désactiver toutes les attaques
    document.querySelectorAll('.move-btn').forEach(btn => {
        btn.disabled = true;
    });
}

// Ajout de message dans le log
function addToLog(message, type) {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// Réinitialisation du jeu
function resetGame() {
    playerPokemon = null;
    enemyPokemon = null;
    
    document.getElementById('pokemon-search').value = '';
    document.getElementById('pokemon-result').innerHTML = '';
    document.getElementById('start-game').disabled = true;
    document.getElementById('battle-log').innerHTML = '';
    
    document.getElementById('battle-screen').classList.remove('active');
    document.getElementById('selection-screen').classList.add('active');
}

// Recherche avec la touche Entrée
document.getElementById('pokemon-search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchPokemon();
    }
});