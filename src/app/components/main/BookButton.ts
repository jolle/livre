import { Main } from './../../routes/Main';
import { Alert, AlertLevel } from '../Alert';

export class BookButton {
    book: any;
    parent: Main;

    constructor(book: any, parent: Main) {
        this.book = book;
        this.parent = parent;
    }

    handleClick(e: Event) {
        if (
            e.target &&
            (e.target as HTMLElement).classList.contains('pin-icon')
        )
            return;

        this.parent.currentlyLoadingBook = this.book.id;
        this.parent.loadingOverlay.style.display = 'block';

        this.book.getBook().then((actualBook: any) => {
            if (!this.isStillBeingOpened()) return; // loading has been cancelled

            if (!actualBook) {
                this.parent.currentlyLoadingBook = null;
                this.parent.loadingOverlay.style.display = 'none';
                Alert.createAlert(
                    AlertLevel.ERROR,
                    "Unfortunately the book you tried to open isn't supported by Livre yet. Check again later!"
                );
                return;
            }

            actualBook.getPages().then((pages: any) => {
                if (!this.isStillBeingOpened()) return; // loading has been cancelled

                this.parent.parent.router.update('book', {
                    pages,
                    book: actualBook,
                    bookSkeleton: this.book
                });
            });
        });
    }

    private isStillBeingOpened() {
        return (
            this.parent.currentlyLoadingBook !== null &&
            this.parent.currentlyLoadingBook === this.book.id
        );
    }

    handlePinClick(pin: boolean) {
        if (pin) {
            this.parent.pinnedBooks.push(this.book.id);
        } else if (this.parent.pinnedBooks.indexOf(this.book.id) > -1) {
            this.parent.pinnedBooks.splice(
                this.parent.pinnedBooks.indexOf(this.book.id),
                1
            );
        }

        this.parent.parent.store.set(
            'livre-pinned-books',
            this.parent.pinnedBooks
        );

        this.parent.update(this.parent.books);
    }
}
