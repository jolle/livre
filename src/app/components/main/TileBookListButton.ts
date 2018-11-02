import { findCoverUrl, getImage } from '../../helpers/CoverFinder';
import { stripBookName } from '../../helpers/BookUtils';
import { Pill } from './Pill';
import { el } from 'redom';
import { Main } from '../../routes/Main';
import { getBookBackground } from '../../helpers/BookUtils';
import { getDominantColor } from '../../helpers/Colors';
import { BookButton } from './BookButton';

export class TileBookListButton extends BookButton {
    static async getElement(book: any, parent: Main) {
        const backgroundImage = await getBookBackground(book);
        const [r, g, b] = await getDominantColor(
            await getImage(backgroundImage)
        );

        const months =
            (book.specifier.match(/([0-9]+)\s*kk/i) || [])[1] ||
            (book.productName.match(/([0-9]+)\s*kk/i) || [])[1];

        const bookElement = el(
            '.relative.bg-white.mb-2.p-2.rounded.shadow.cursor-pointer.hover:shadow-md.hover:scale-10.transition-all-1/2s.overflow-hidden.w-full',
            el('.absolute.pin-t.pin-b.pin-r.pin-l.-m-6.z-10', {
                style: {
                    filter: 'blur(20px)',
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    zIndex: '-1'
                }
            }),
            el(
                '.z-50.flex.items-center',
                el('img.inline-block.bg-grey-light.h-8.shadow.rounded', {
                    src: await findCoverUrl(book.id)
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
                            stripBookName(book.productName)
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

        bookElement.addEventListener(
            'click',
            this.handleClick.bind(this, book, parent)
        );

        return bookElement;
    }
}
