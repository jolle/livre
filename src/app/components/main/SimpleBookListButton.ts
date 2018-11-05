import { BookButton } from './BookButton';
import { getImage } from './../../helpers/CoverFinder';
import { stripBookName } from './../../helpers/BookUtils';
import { el } from 'redom';
import { Main } from '../../routes/Main';
import { getDominantColor } from '../../helpers/Colors';
import { getBookBackground } from '../../helpers/BookUtils';

export class SimpleBookListButton extends BookButton {
    async getElement() {
        const [r, g, b] = await getDominantColor(
            await getImage(await getBookBackground(this.book))
        );

        const months =
            (this.book.specifier.match(/([0-9]+)\s*kk/i) || [])[1] ||
            (this.book.productName.match(/([0-9]+)\s*kk/i) || [])[1];

        let pin: HTMLElement;

        const bookElement = el(
            '.group.relative.bg-white.mb-2.p-3.rounded.shadow.cursor-pointer.hover:shadow-md.hover:scale-10.transition-all-1/2s.overflow-hidden.w-full',
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
                            stripBookName(this.book.productName)
                        )
                    ),
                    el(
                        '.w-32.flex.justify-between.items-center',
                        (pin = el(
                            `.inline-block.shadow${
                                this.parent.pinnedBooks.includes(this.book.id)
                                    ? '.pin-icon-active'
                                    : '.opacity-0.group-hover:opacity-100'
                            }.w-4.h-4.ml-6.pin-icon.bg-white.-mb-1.transition:opacity`
                        )),
                        el(
                            '.text-white.tracking-wide.font-bold.text-sm.uppercase.inline-block',
                            months ? `${months}kk` : '',
                            {
                                style: {
                                    textShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
                                }
                            }
                        )
                    )
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
