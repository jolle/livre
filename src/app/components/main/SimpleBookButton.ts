import { getImage } from './../../helpers/CoverFinder';
import { getDominantColor } from './../../helpers/Colors';
import { stripBookName, getBookBackground } from './../../helpers/BookUtils';
const dominant = require('huey/dominant');
import { Pill } from './Pill';
import axios from 'axios';
import { el } from 'redom';
import { Main } from '../../routes/Main';

export class SimpleBookButton {
    static async getElement(book: any, parent: Main) {
        const [r, g, b] = await getDominantColor(
            await getImage(await getBookBackground(book))
        );

        const months =
            (book.specifier.match(/([0-9]+)\s*kk/i) || [])[1] ||
            (book.productName.match(/([0-9]+)\s*kk/i) || [])[1];

        const bookElement = el(
            '.relative.p-6.rounded.shadow.mb-4.mr-4.cursor-pointer.hover:shadow-md.hover:scale-10.transition-all-1/2s.overflow-hidden',
            {
                style: {
                    width: 'calc((100vw / 3) - 24px)',
                    backgroundColor: `rgb(${r}, ${g}, ${b})`
                }
            },
            el(
                '.z-50',
                el(
                    '.my-8',
                    el(
                        `h2.text-2xl.font-bold.text-center.text-white`,
                        {
                            style: {
                                textShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
                            }
                        },
                        stripBookName(book.productName)
                    )
                ),
                el(
                    '.h-6.mt-2.flex.justify-center.text-white.tracking-wide.font-bold.text-sm.uppercase',
                    months ? `${months}kk` : '',
                    {
                        style: {
                            textShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
                        }
                    }
                )
            )
        );

        bookElement.addEventListener('click', () => {
            parent.currentlyLoadingBook = book.id;
            parent.loadingOverlay.style.display = 'block';

            book.getBook().then((actualBook: any) => {
                if (
                    parent.currentlyLoadingBook === null ||
                    parent.currentlyLoadingBook !== book.id
                )
                    return; // loading has been cancelled
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
        });

        return bookElement;
    }
}
