class BookManager {
    constructor() {
        this.books = [];
    }
    // Charger tous les livres
    async loadBooks() {
        try {
            const response = await fetch('/api/books');
            this.books = await response.json();
            this.displayBooks();
            this.loadGlobalStats();
        }
        catch (error) {
            console.error('Erreur lors du chargement des livres:', error);
        }
    }
    // Charger les statistiques globales
    async loadGlobalStats() {
        try {
            const response = await fetch('/api/books/stats');
            const stats = await response.json();
            this.displayGlobalStats(stats);
        }
        catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }
    // Afficher les statistiques globales
    displayGlobalStats(stats) {
        const totalBooksEl = document.getElementById('total-books');
        const booksReadEl = document.getElementById('books-read');
        const totalPagesEl = document.getElementById('total-pages');
        const progressPercentageEl = document.getElementById('progress-percentage');
        if (totalBooksEl)
            totalBooksEl.textContent = stats.totalBooks.toString();
        if (booksReadEl)
            booksReadEl.textContent = stats.booksRead.toString();
        if (totalPagesEl)
            totalPagesEl.textContent = stats.totalPages.toString();
        if (progressPercentageEl)
            progressPercentageEl.textContent = `${stats.readingPercentage.toFixed(1)}%`;
    }
    // Afficher la liste des livres
    displayBooks() {
        const booksList = document.getElementById('books-list');
        if (!booksList)
            return;
        if (this.books.length === 0) {
            booksList.innerHTML = '<p class="text-center text-gray-500 py-8">Aucun livre ajouté pour le moment.</p>';
            return;
        }
        booksList.innerHTML = this.books.map(book => `
            <div class="book-card bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800">${book.title}</h3>
                        <p class="text-gray-600">par ${book.author}</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full 
                                    ${this.getStatusColor(book.status)}">
                            ${book.status}
                        </span>
                        <span class="block text-sm text-gray-500 mt-1">${book.format}</span>
                    </div>
                </div>

                <div class="mb-3">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progression: ${book.pagesRead}/${book.numberOfPages} pages</span>
                        <span class="font-semibold">${book.readingPercentage.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="progress-bar h-2 rounded-full ${this.getProgressColor(book.readingPercentage)}" 
                             style="width: ${book.readingPercentage}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                        <span class="font-medium">Prix:</span> ${book.price}€
                    </div>
                    <div>
                        <span class="font-medium">Suggéré par:</span> ${book.suggestedBy}
                    </div>
                </div>

                <div class="flex space-x-2">
                    <button onclick="bookManager.updateProgress('${book._id}', ${book.pagesRead + 10})" 
                            class="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition duration-200">
                        +10 pages
                    </button>
                    <button onclick="bookManager.updateProgress('${book._id}', ${book.pagesRead + 1})" 
                            class="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition duration-200">
                        +1 page
                    </button>
                    <button onclick="bookManager.deleteBook('${book._id}')" 
                            class="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition duration-200">
                        Supprimer
                    </button>
                </div>
            </div>
        `).join('');
    }
    // Ajouter un nouveau livre
    async addBook(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const bookData = {
            title: formData.get('title'),
            author: formData.get('author'),
            numberOfPages: parseInt(formData.get('numberOfPages')),
            status: formData.get('status'),
            price: parseFloat(formData.get('price')),
            pagesRead: parseInt(formData.get('pagesRead')),
            format: formData.get('format'),
            suggestedBy: formData.get('suggestedBy')
        };
        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData)
            });
            if (response.ok) {
                form.reset();
                this.loadBooks();
                this.showNotification('Livre ajouté avec succès!', 'success');
            }
            else {
                throw new Error('Erreur lors de l\'ajout du livre');
            }
        }
        catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de l\'ajout du livre', 'error');
        }
    }
    // Mettre à jour la progression
    async updateProgress(bookId, newPagesRead) {
        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pagesRead: newPagesRead })
            });
            if (response.ok) {
                this.loadBooks();
                this.showNotification('Progression mise à jour!', 'success');
            }
            else {
                throw new Error('Erreur lors de la mise à jour');
            }
        }
        catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de la mise à jour', 'error');
        }
    }
    // Supprimer un livre
    async deleteBook(bookId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre?')) {
            return;
        }
        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                this.loadBooks();
                this.showNotification('Livre supprimé avec succès!', 'success');
            }
            else {
                throw new Error('Erreur lors de la suppression');
            }
        }
        catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }
    // Couleurs pour les statuts
    getStatusColor(status) {
        const colors = {
            'Read': 'bg-green-100 text-green-800',
            'Currently reading': 'bg-blue-100 text-blue-800',
            'Want to read': 'bg-yellow-100 text-yellow-800',
            'Re-read': 'bg-purple-100 text-purple-800',
            'DNF': 'bg-red-100 text-red-800',
            'Returned Unread': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }
    // Couleurs pour la barre de progression
    getProgressColor(percentage) {
        if (percentage >= 100)
            return 'bg-green-500';
        if (percentage >= 75)
            return 'bg-blue-500';
        if (percentage >= 50)
            return 'bg-yellow-500';
        if (percentage >= 25)
            return 'bg-orange-500';
        return 'bg-red-500';
    }
    // Notification
    showNotification(message, type) {
        // Implémentation simple des notifications
        alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
    }
}
// Initialisation
const bookManager = new BookManager();
// Événements au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Charger les livres
    bookManager.loadBooks();
    // Gérer le formulaire
    const bookForm = document.getElementById('book-form');
    if (bookForm) {
        bookForm.addEventListener('submit', (e) => bookManager.addBook(e));
    }
});
