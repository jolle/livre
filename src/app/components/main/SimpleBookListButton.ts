import { getImage } from './../../helpers/CoverFinder';
import { stripBookName } from './../../helpers/BookUtils';
const dominant = require('huey/dominant');
import { Pill } from './Pill';
import axios from 'axios';
import { el } from 'redom';
import { Main } from '../../routes/Main';
import { getDominantColor } from '../../helpers/Colors';
import { getBookBackground } from '../../helpers/BookUtils';

export class SimpleBookListButton {
    static async getElement(book: any, parent: Main) {
        const [r, g, b] = await getDominantColor(
            await getImage(await getBookBackground(book))
        );

        const months =
            (book.specifier.match(/([0-9]+)\s*kk/i) || [])[1] ||
            (book.productName.match(/([0-9]+)\s*kk/i) || [])[1];

        const bookElement = el(
            '.relative.bg-white.mb-2.p-3.rounded.shadow.cursor-pointer.hover:shadow-md.hover:scale-10.transition-all-1/2s.overflow-hidden.w-full',
            {
                style: {
                    backgroundColor: `rgb(${r}, ${g}, ${b})`
                }
            },
            el(
                '.z-50.flex.items-center',
                el(
                    '.flex.justify-between.items-center.w-full',
                    el(
                        '.',
                        el(
                            `h2.text-base.font-bold.text-white`,
                            {
                                style: {
                                    textShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
                                }
                            },
                            stripBookName(book.productName)
                        )
                    ),
                    el(
                        '.text-white.tracking-wide.font-bold.text-sm.uppercase',
                        months ? `${months}kk` : '',
                        {
                            style: {
                                textShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
                            }
                        }
                    )
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
