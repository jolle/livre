import { getImage, findCoverUrl } from '../../helpers/CoverFinder';
import { getDominantColor } from '../../helpers/Colors';
import { stripBookName, getBookBackground } from '../../helpers/BookUtils';
import { Pill } from './Pill';
import { el } from 'redom';
import { BookButton } from './BookButton';
export class TileBookButton extends BookButton {
    async getElement() {
        const backgroundImage = await getBookBackground(this.book);
        const [r, g, b] = await getDominantColor(
            await getImage(backgroundImage)
        );

        const months =
            (this.book.specifier.match(/([0-9]+)\s*kk/i) || [])[1] ||
            (this.book.productName.match(/([0-9]+)\s*kk/i) || [])[1];

        let pin: HTMLElement;

        const bookElement = el(
            '.group.relative.bg-white.p-6.rounded.shadow.mb-4.mr-4.cursor-pointer.hover:shadow-md.hover:scale-10.transition-all-1/2s.overflow-hidden',
            {
                style: {
                    width: 'calc((100% / 3) - 24px)'
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
                (pin = el(
                    `.absolute.pin-t.pin-r.shadow${
                        this.parent.pinnedBooks.includes(this.book.id)
                            ? '.pin-icon-active'
                            : '.opacity-0.group-hover:opacity-100'
                    }.w-6.h-6.mt-3.mr-2.pin-icon.bg-white.transition:opacity`
                )),
                el('img.block.bg-grey-light.h-32.mb-4.mx-auto.shadow-lg', {
                    src: await findCoverUrl(this.book.id),
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
                        stripBookName(this.book.productName)
                    )
                ),
                el(
                    '.h-6.mt-2.flex.justify-center',
                    ...(months ? [new Pill(`${months}kk`, [r, g, b]).el] : [])
                )
            )
        );

        bookElement.addEventListener('click', this.handleClick.bind(this));

        pin.addEventListener('click', () => {
            const state = !pin.classList.contains('pin-icon-active');

            if (state) {
                pin.classList.add('pin-icon-active');
                pin.classList.remove('opacity-0', 'group-hover:opacity-100');
            } else {
                pin.classList.remove('pin-icon-active');
                pin.classList.add('opacity-0', 'group-hover:opacity-100');
            }

            this.handlePinClick(state);
        });

        return bookElement;
    }
}
