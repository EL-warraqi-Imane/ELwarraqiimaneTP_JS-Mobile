import { Router } from 'express';
import Book, { IBook, BookStatus, BookFormat } from '../models/Book';
import { Book as BookClass } from '../models/BookClass';

const router = Router();

// GET - Tous les livres
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des livres' });
  }
});

// GET - Statistiques globales
router.get('/stats', async (req, res) => {
  try {
    const books = await Book.find();
    const totalBooks = books.length;
    const booksRead = books.filter(book => book.finished).length;
    const totalPages = books.reduce((sum, book) => sum + book.numberOfPages, 0);
    const pagesRead = books.reduce((sum, book) => sum + book.pagesRead, 0);

    res.json({
      totalBooks,
      booksRead,
      totalPages,
      pagesRead,
      readingPercentage: totalPages > 0 ? (pagesRead / totalPages) * 100 : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
});

// POST - Nouveau livre
router.post('/', async (req, res) => {
  try {
    const bookData = req.body;
    
    // Utiliser la classe Book pour la logique métier
    const bookInstance = BookClass.fromObject(bookData);
    
    // Créer le document MongoDB
    const newBook = new Book({
      ...bookData,
      finished: bookInstance.finished,
      readingPercentage: bookInstance.getReadingPercentage()
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la création du livre' });
  }
});

// PUT - Mettre à jour un livre
router.put('/:id', async (req, res) => {
  try {
    const { pagesRead } = req.body;
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    // Utiliser la classe Book pour la logique métier
    const bookInstance = BookClass.fromObject(book.toObject());
    bookInstance.currentlyAt(pagesRead);

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { 
        pagesRead,
        finished: bookInstance.finished,
        readingPercentage: bookInstance.getReadingPercentage()
      },
      { new: true }
    );

    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour du livre' });
  }
});

// DELETE - Supprimer un livre
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    // Utiliser la classe Book pour la logique métier
    const bookInstance = BookClass.fromObject(book.toObject());
    bookInstance.deleteBook();

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Livre supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du livre' });
  }
});

export default router;