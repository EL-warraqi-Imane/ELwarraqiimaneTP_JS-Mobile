const express = require('express');
const router = express.Router();

// Middleware de vérification d'authentification
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// Données des livres (variable locale)
const books = [
  { title: 'Livre 1', author: 'Auteur 1' },
  { title: 'Livre 2', author: 'Auteur 2' },
  { title: 'Livre 3', author: 'Auteur 3' }
];

// Page des livres
router.get('/books', isAuthenticated, (req, res) => {
  res.render('books', { books, user: req.user });
});

module.exports = router;