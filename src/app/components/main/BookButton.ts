import { Main } from './../../routes/Main';
import { Alert, AlertLevel } from '../Alert';

export class BookButton {
    static handleClick(book: any, parent: Main) {
        parent.currentlyLoadingBook = book.id;
        parent.loadingOverlay.style.display = 'block';

        book.getBook().then((actualBook: any) => {
            if (
                parent.currentlyLoadingBook === null ||
                parent.currentlyLoadingBook !== book.id
            )
                return; // loading has been cancelled

            if (!actualBook) {
                parent.currentlyLoadingBook = null;
                parent.loadingOverlay.style.display = 'none';
                document.body.appendChild(
                    new Alert(
                        AlertLevel.ERROR,
                        "Unfortunately the book you tried to open isn't supported by Livre yet. Check again later!"
                    ).el
                );
                return;
            }

            actualBook.getPages().then((pages: any) => {
                if (
                    parent.currentlyLoadingBook === null ||
                    parent.currentlyLoadingBook !== book.id
                )
                    return; // loading has been cancelled
                parent.parent.router.update('book', {
                    pages,
                    book: actualBook
                });
            });
        });
    }
}
