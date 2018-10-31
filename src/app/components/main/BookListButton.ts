const dominant = require('huey/dominant');
import { Pill } from './Pill';
import axios from 'axios';
import { el } from 'redom';
import { Main } from '../../routes/Main';

export class BookListButton {
    static async getElement(book: any, parent: Main) {
        const backgroundImage = await this.getBookBackground(book, parent);
        const [r, g, b] = await this.getDominantColor(backgroundImage);

        const months =
            (book.specifier.match(/([0-9]+)\s*kk/i) || [])[1] ||
            (book.productName.match(/([0-9]+)\s*kk/i) || [])[1];

        const bookElement = el(
            '.relative.bg-white.mb-2.p-2.rounded.shadow.cursor-pointer.hover:shadow-md.hover:scale-10.transition-all-1/2s.overflow-hidden.w-full',
            el('.absolute.pin-t.pin-b.pin-r.pin-l.-m-6.z-10', {
                style: {
                    filter: 'blur(15px)',
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover cover',
                    zIndex: '-1'
                }
            }),
            el(
                '.z-50.flex.items-center',
                el('img.inline-block.bg-grey-light.h-8.shadow.rounded', {
                    src: book.frontCoverURL
                }),
                el(
                    '.flex.justify-between.items-center.w-full',
                    el(
                        '.ml-4',
                        el(
                            `h2.text-lg.font-bold.text-white`,
                            {
                                style: {
                                    textShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
                                }
                            },
                            this.stripBookName(book.productName)
                        )
                    ),
                    el(
                        '.ml-4',
                        ...(months
                            ? [new Pill(`${months}kk`, [r, g, b]).el]
                            : [])
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

    static stripBookName(name: string) {
        //const duration = (name.match(/([0-9]+) kk/) || [])[1];

        name = name.replace(
            /\s-\s[A-Z]+[0-9]+\s[^:]+\s?:?\s?yhden käyttäjän lisenssi/g,
            ''
        );
        name = name.replace(/\s-\s[A-Z]+[0-9]+/g, '');
        name = name.replace(/\s?(:|-)?\s?yhden käyttäjän lisenssi/gi, '');
        name = name.replace(/\s?ONL(INE)?/g, '');
        name = name.replace(/\s?\([^)]+\)/g, '');
        name = name.replace(/\s?digikirja/g, '');
        name = name.replace(/\s?[0-9]+ kk/g, '');
        name = name.trim();

        return name;
    }

    static async getBookBackground(book: any, parent: Main) {
        if (parent.parent.store.has(`livre-book-background-${book.id}`))
            return parent.parent.store.get(`livre-book-background-${book.id}`);

        const setStoreAndReturn = (bg: string) => {
            parent.parent.store.set(`livre-book-background-${book.id}`, bg);
            return bg;
        };

        const cloubiBackground = `https://cloubi.otava.fi/html/cloubi/edge/product-themes/Otava${this.stripBookName(
            book.productName
        ).replace(/\s/g, '')}ProductTheme/img/period_background.jpg`;
        const { status } = await axios.head(cloubiBackground, {
            validateStatus: () => true
        });
        if (status === 200) return setStoreAndReturn(cloubiBackground);

        return setStoreAndReturn(book.frontCoverURL);
    }

    static async getDominantColor(imageUrl: string) {
        const imgOfBg = (await new Promise(resolve => {
            const img = new Image();
            img.src = imageUrl;
            img.addEventListener('load', () => resolve(img));
            img.addEventListener('error', () => resolve());
        })) as HTMLImageElement;

        if (!imgOfBg) return;

        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = imgOfBg.width;
        tmpCanvas.height = imgOfBg.height;
        const ctx = tmpCanvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(imgOfBg, 0, 0);
        const { data } = ctx.getImageData(
            0,
            0,
            tmpCanvas.width,
            tmpCanvas.height
        );

        return dominant(data) || [0, 0, 0];
    }
}
