interface Book {
    _id: string;
    title: string;
    author: string;
    numberOfPages: number;
    status: string;
    price: number;
    pagesRead: number;
    format: string;
    suggestedBy: string;
    finished: boolean;
    readingPercentage: number;
}

interface GlobalStats {
    totalBooks: number;
    booksRead: number;
    totalPages: number;
    pagesRead: number;
    readingPercentage: number;
}

class BookManager {
    private books: Book[] = [];

    // Charger tous les livres
    async loadBooks(): Promise<void> {
        try {
            const response = await fetch('/api/books');
            this.books = await response.json();
            this.displayBooks();
            this.loadGlobalStats();
        } catch (error) {
            console.error('Erreur lors du chargement des livres:', error);
        }
    }

    // Charger les statistiques globales
    async loadGlobalStats(): Promise<void> {
        try {
            const response = await fetch('/api/books/stats');
            const stats: GlobalStats = await response.json();
            this.displayGlobalStats(stats);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }

    // Afficher les statistiques globales
    private displayGlobalStats(stats: GlobalStats): void {
        const totalBooksEl = document.getElementById('total-books');
        const booksReadEl = document.getElementById('books-read');
        const totalPagesEl = document.getElementById('total-pages');
        const progressPercentageEl = document.getElementById('progress-percentage');

        if (totalBooksEl) totalBooksEl.textContent = stats.totalBooks.toString();
        if (booksReadEl) booksReadEl.textContent = stats.booksRead.toString();
        if (totalPagesEl) totalPagesEl.textContent = stats.totalPages.toString();
        if (progressPercentageEl) progressPercentageEl.textContent = `${stats.readingPercentage.toFixed(1)}%`;
    }

    // Afficher la liste des livres
    private displayBooks(): void {
        const booksList = document.getElementById('books-list');
        if (!booksList) return;

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
    async addBook(event: Event): Promise<void> {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const bookData = {
            title: formData.get('title') as string,
            author: formData.get('author') as string,
            numberOfPages: parseInt(formData.get('numberOfPages') as string),
            status: formData.get('status') as string,
            price: parseFloat(formData.get('price') as string),
            pagesRead: parseInt(formData.get('pagesRead') as string),
            format: formData.get('format') as string,
            suggestedBy: formData.get('suggestedBy') as string
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
            } else {
                throw new Error('Erreur lors de l\'ajout du livre');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de l\'ajout du livre', 'error');
        }
    }

    // Mettre à jour la progression
    async updateProgress(bookId: string, newPagesRead: number): Promise<void> {
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
            } else {
                throw new Error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de la mise à jour', 'error');
        }
    }

    // Supprimer un livre
    async deleteBook(bookId: string): Promise<void> {
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
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }

    // Couleurs pour les statuts
    private getStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
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
    private getProgressColor(percentage: number): string {
        if (percentage >= 100) return 'bg-green-500';
        if (percentage >= 75) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        if (percentage >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    }

    // Notification
    private showNotification(message: string, type: 'success' | 'error'): void {
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