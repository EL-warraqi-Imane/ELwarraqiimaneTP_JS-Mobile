import { BookStatus, BookFormat } from './Book';

export class Book {
  constructor(
    public title: string,
    public author: string,
    public numberOfPages: number,
    public status: BookStatus,
    public price: number,
    public pagesRead: number,
    public format: BookFormat,
    public suggestedBy: string,
    public finished: boolean = false
  ) {
    this.finished = this.pagesRead >= this.numberOfPages;
  }

  // Méthode pour mettre à jour la progression
  currentlyAt(pagesRead: number): void {
    this.pagesRead = pagesRead;
    this.finished = this.pagesRead >= this.numberOfPages;
  }

  // Méthode pour calculer le pourcentage
  getReadingPercentage(): number {
    return (this.pagesRead / this.numberOfPages) * 100;
  }

  // Méthode pour supprimer (simulation)
  deleteBook(): void {
    console.log(`Book "${this.title}" marked for deletion`);
  }

  // Méthode statique pour créer depuis un objet
  static fromObject(obj: any): Book {
    return new Book(
      obj.title,
      obj.author,
      obj.numberOfPages,
      obj.status,
      obj.price,
      obj.pagesRead,
      obj.format,
      obj.suggestedBy,
      obj.finished
    );
  }
}