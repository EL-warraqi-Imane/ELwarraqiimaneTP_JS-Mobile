const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // ← AJOUT IMPORT MANQUANT
const session = require('express-session');
const MongoStore = require('connect-mongo'); // ← NOUVELLE SYNTAXE

const app = express();
const PORT = 3001;

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/tp2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = require('./models/User');

// Configuration Passport
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false);
      
      // Ici, vous devriez utiliser bcrypt pour comparer les mots de passe
      if (user.password !== password) return done(null, false);
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session - AVEC LA NOUVELLE SYNTAXE
app.use(session({
  secret: 'votre_secret_super_securise',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: 'mongodb://localhost:27017/tp2' // ← NOUVELLE SYNTAXE
  })
}));

app.use(passport.initialize());
app.use(passport.session());

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