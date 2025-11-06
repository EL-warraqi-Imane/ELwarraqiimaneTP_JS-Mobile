const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Routes API
app.get('/api/pokemon/:name', async (req, res) => {
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.params.name}`);
        const pokemon = response.data;
        
        // Récupérer les 5 premiers moves avec leurs détails
        const moves = [];
        for (let i = 0; i < Math.min(5, pokemon.moves.length); i++) {
            const moveResponse = await axios.get(pokemon.moves[i].move.url);
            const moveData = moveResponse.data;
            
            moves.push({
                name: moveData.name,
                power: moveData.power || 0,
                accuracy: moveData.accuracy || 100,
                pp: moveData.pp || 20,
                type: moveData.type.name
            });
        }
        
        const pokemonData = {
            name: pokemon.name,
            sprite: pokemon.sprites.front_default,
            hp: 300, // PV fixes à 300
            moves: moves
        };
        
        res.json(pokemonData);
    } catch (error) {
        res.status(404).json({ error: 'Pokémon non trouvé' });
    }
});

app.get('/api/random-pokemon', async (req, res) => {
    try {
        // Pokémon aléatoire entre 1 et 151 (première génération)
        const randomId = Math.floor(Math.random() * 151) + 1;
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const pokemon = response.data;
        
        const moves = [];
        for (let i = 0; i < Math.min(5, pokemon.moves.length); i++) {
            const moveResponse = await axios.get(pokemon.moves[i].move.url);
            const moveData = moveResponse.data;
            
            moves.push({
                name: moveData.name,
                power: moveData.power || 0,
                accuracy: moveData.accuracy || 100,
                pp: moveData.pp || 20,
                type: moveData.type.name
            });
        }
        
        const pokemonData = {
            name: pokemon.name,
            sprite: pokemon.sprites.front_default,
            hp: 300,
            moves: moves
        };
        
        res.json(pokemonData);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.listen(PORT, () => {
    console.log(`🎮 Serveur du jeu Pokémon démarré sur http://localhost:${PORT}`);
});