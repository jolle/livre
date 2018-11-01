import { getImage, findCoverUrl } from './../../helpers/CoverFinder';
import { getDominantColor } from './../../helpers/Colors';
import { stripBookName, getBookBackground } from './../../helpers/BookUtils';
import { Pill } from './Pill';
import { el } from 'redom';
import { Main } from '../../routes/Main';

export class BookButton {
    static async getElement(book: any, parent: Main) {
        const backgroundImage = await getBookBackground(book);
        const [r, g, b] = await getDominantColor(
            await getImage(backgroundImage)
        );

        const months =
            (book.specifier.match(/([0-9]+)\s*kk/i) || [])[1] ||
            (book.productName.match(/([0-9]+)\s*kk/i) || [])[1];

        const bookElement = el(
            '.relative.bg-white.p-6.rounded.shadow.mb-4.mr-4.cursor-pointer.hover:shadow-md.hover:scale-10.transition-all-1/2s.overflow-hidden',
            {
                style: {
                    width: 'calc((100vw / 3) - 24px)'
                }
            },
            el('.absolute.pin-t.pin-b.pin-r.pin-l.-m-6.z-10', {
                style: {
                    filter: 'blur(20px)',
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    zIndex: '-1'
                }
            }),
            el(
                '.z-50',
                el('img.block.bg-grey-light.h-32.mb-4.mx-auto.shadow', {
                    src: await findCoverUrl(book.id),
                    style: {
                        borderRadius: '15px'
                    }
                }),
                el(
                    '.h-6',
                    el(
                        `h2.text-lg.font-bold.text-center.text-white`,
                        {
                            style: {
                                textShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
                            }
                        },
                        stripBookName(book.productName)
                    )
                ),
                el(
                    '.h-6.mt-2.flex.justify-center',
                    ...(months ? [new Pill(`${months}kk`, [r, g, b]).el] : [])
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
