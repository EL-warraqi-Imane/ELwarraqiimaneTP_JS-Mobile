const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');



const app = express();
const PORT = 3002;
// Ajoutez ce code TEMPORAIREMENT dans votre index.js pour générer un secret


// Copiez le résultat et utilisez-le
// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/tp2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(session({
  secret: 'a7712a8d856915d87964b86ed7ec858909cc2d34091f8e9339c7d671291d8a71f79734fc9da7a0403d7534d164d2a67213b7ae34286f632d0299ccf86eac0404',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: 'mongodb://localhost:27017/tp2',
    ttl: 14 * 24 * 60 * 60 // = 14 jours
  })
}));

// Initialiser Passport (IMPORTANT : après les sessions)
// Importer Passport configuré
const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());
// Configuration Passport


// Vues
app.set('view engine', 'pug');
app.set('views', './src/views');

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/books'));

// Route racine
app.get('/', (req, res) => {
  res.redirect('/books');
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});