import { Main } from './../../routes/Main';
import { Alert, AlertLevel } from '../Alert';

export class BookButton {
    book: any;
    parent: Main;

    constructor(book: any, parent: Main) {
        this.book = book;
        this.parent = parent;
    }

    handleClick() {
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
                    book: actualBook
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
}
