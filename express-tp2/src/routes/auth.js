const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Page d'inscription
router.get('/register', (req, res) => {
  res.render('register');
});

// Traitement de l'inscription
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ username, password, email });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.redirect('/register');
  }
});

// Page de connexion
router.get('/login', (req, res) => {
  res.render('login');
});

// Traitement de la connexion
router.post('/login', passport.authenticate('local', {
  successRedirect: '/books',
  failureRedirect: '/login'
}));

// Déconnexion
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;