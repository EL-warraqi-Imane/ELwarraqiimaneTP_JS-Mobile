import { Schema, model, Document } from 'mongoose';

// Enum pour le statut
export enum BookStatus {
  Read = 'Read',
  ReRead = 'Re-read',
  DNF = 'DNF',
  CurrentlyReading = 'Currently reading',
  ReturnedUnread = 'Returned Unread',
  WantToRead = 'Want to read'
}

// Enum pour le format
export enum BookFormat {
  Print = 'Print',
  PDF = 'PDF',
  Ebook = 'Ebook',
  AudioBook = 'AudioBook'
}

// Interface TypeScript
export interface IBook extends Document {
  title: string;
  author: string;
  numberOfPages: number;
  status: BookStatus;
  price: number;
  pagesRead: number;
  format: BookFormat;
  suggestedBy: string;
  finished: boolean;
  readingPercentage: number;
}

// Schéma Mongoose
const bookSchema = new Schema<IBook>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  numberOfPages: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(BookStatus), 
    required: true 
  },
  price: { type: Number, required: true },
  pagesRead: { type: Number, default: 0 },
  format: { 
    type: String, 
    enum: Object.values(BookFormat), 
    required: true 
  },
  suggestedBy: { type: String, required: true },
  finished: { type: Boolean, default: false },
  readingPercentage: { type: Number, default: 0 }
});

// Middleware pour calculer le pourcentage et finished
bookSchema.pre('save', function(next) {
  this.readingPercentage = (this.pagesRead / this.numberOfPages) * 100;
  this.finished = this.pagesRead >= this.numberOfPages;
  next();
});

export default model<IBook>('Book', bookSchema);