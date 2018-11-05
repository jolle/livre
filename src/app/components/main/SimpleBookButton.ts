import { BookButton } from './BookButton';
import { getImage } from './../../helpers/CoverFinder';
import { getDominantColor } from './../../helpers/Colors';
import { stripBookName, getBookBackground } from './../../helpers/BookUtils';
import { el } from 'redom';
import { Main } from '../../routes/Main';

export class SimpleBookButton extends BookButton {
    async getElement() {
        const [r, g, b] = await getDominantColor(
            await getImage(await getBookBackground(this.book))
        );

        const months =
            (this.book.specifier.match(/([0-9]+)\s*kk/i) || [])[1] ||
            (this.book.productName.match(/([0-9]+)\s*kk/i) || [])[1];

        let pin: HTMLElement;

        const bookElement = el(
            '.group.relative.p-6.rounded.shadow.mb-4.mr-4.cursor-pointer.hover:shadow-md.hover:scale-10.transition-all-1/2s.overflow-hidden',
            {
                style: {
                    width: 'calc((100% / 3) - 24px)',
                    backgroundColor: `rgb(${r}, ${g}, ${b})`
                }
            },
            el(
                '.z-50',
                (pin = el(
                    `.absolute.pin-t.pin-r.shadow${
                        this.parent.pinnedBooks.includes(this.book.id)
                            ? '.pin-icon-active'
                            : '.opacity-0.group-hover:opacity-100'
                    }.w-6.h-6.mt-3.mr-2.pin-icon.bg-white.transition:opacity`
                )),
                el(
                    '.my-8',
                    el(
                        `h2.text-2xl.font-bold.text-center.text-white`,
                        {
                            style: {
                                textShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
                            }
                        },
                        stripBookName(this.book.productName)
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
