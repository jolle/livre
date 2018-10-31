import { BookButton } from './../components/main/BookButton';
import { App } from './../App';
import { el, setChildren } from 'redom';

enum GroupingStyle {
    MIXED = 'mixed',
    BY_SUBJECT = 'by subject'
}

enum SortingOrder {
    BOUGHT_NEW_TO_OLD = 'buy date (newest to oldest)',
    BOUGHT_OLD_TO_NEW = 'buy date (oldest to newest)',
    ALPHABETICAL_A_TO_Z = 'alphabetical (a to z)',
    ALPHABETICAL_Z_TO_A = 'alphabetical (z to a)'
}

export class Main {
    el: HTMLElement;
    bookContainer: HTMLElement;
    groupingStyle: GroupingStyle;
    sortingOrder: SortingOrder;
    books: any[];

    groupingStyleInput: HTMLSelectElement;
    sortingOrderInput: HTMLSelectElement;

    parent: App;

    currentlyLoadingBook: any | null;

    loadingOverlay: HTMLElement;
    closeLoader: HTMLElement;

    constructor(parent: App) {
        this.parent = parent;

        this.currentlyLoadingBook = null;

        this.groupingStyle =
            parent.store.get('livre-grouping-style') || GroupingStyle.MIXED;
        this.sortingOrder =
            parent.store.get('livre-sorting-order') ||
            SortingOrder.BOUGHT_OLD_TO_NEW;
        this.books = [];

        this.el = el(
            '.px-4.bg-grey-lightest.w-screen.h-screen.overflow-y-scroll.overflow-x-hidden',
            (this.loadingOverlay = el(
                '.absolute.pin-t.pin-b.pin-l.pin-r.flex.items-center.justify-center.z-50',
                {
                    style: {
                        backgroundColor: 'rgba(248, 250, 252, 0.5)',
                        backdropFilter: 'blur(10px)',
                        display: 'none'
                    }
                },
                el('.loader.absolute', {
                    style: {
                        top: '50vh',
                        marginTop: '-40px',
                        left: '50vw',
                        marginLeft: '-40px'
                    }
                }),
                (this.closeLoader = el(
                    '.absolute.pin-t.pin-r.mt-8.mr-8.font-bold.text-2xl.text-grey-darker.cursor-pointer',
                    '×'
                ))
            )),
            el(
                'header.bg-white.pt-12.py-4.px-6.border-b.border-grey-lighter.-mx-6.sticky.pin-t.z-30',
                el(
                    '.mr-4.text-grey-dark.inline-block.w-64',
                    el(
                        'h4.text-xs.tracking-wide.uppercase.mb-1',
                        'Grouping style'
                    ),
                    el(
                        '.custom-select.w-full',
                        (this.groupingStyleInput = el(
                            'select.w-full',
                            ['mixed', 'by subject'].map(term =>
                                el(
                                    'option',
                                    {
                                        value: term,
                                        selected: term === this.groupingStyle
                                    },
                                    term
                                )
                            )
                        ) as HTMLSelectElement)
                    )
                ),
                el(
                    '.mr-4.text-grey-dark.inline-block',
                    el(
                        'h4.text-xs.tracking-wide.uppercase.mb-1',
                        'Sorting order'
                    ),
                    el(
                        '.custom-select',
                        (this.sortingOrderInput = el(
                            'select',
                            [
                                'buy date (newest to oldest)',
                                'buy date (oldest to newest)',
                                'alphabetical (a to z)',
                                'alphabetical (z to a)'
                            ].map(term =>
                                el(
                                    'option',
                                    {
                                        value: term,
                                        selected: term === this.sortingOrder
                                    },
                                    term
                                )
                            )
                        ) as HTMLSelectElement)
                    )
                )
            ),
            (this.bookContainer = el(
                '.relative.pt-4.flex.items-start.flex-wrap.overflow-scroll.-mr-4.z-10',
                ...Array(4)
                    .fill(null)
                    .map(() =>
                        el(
                            '.bg-white.p-4.rounded.shadow.mb-4.mr-4.h-1/3',
                            {
                                style: {
                                    width: `${window.innerWidth / 3 - 24}px`
                                }
                            },
                            el(
                                '.block.rounded.bg-grey-light.h-32.mb-4.mx-auto'
                            ),
                            el(
                                '.h-12',
                                el('.loader-text-1'),
                                el('.loader-text-2')
                            )
                        )
                    )
            ))
        );

        this.groupingStyleInput.addEventListener('change', () => {
            this.groupingStyle = this.groupingStyleInput.value as GroupingStyle;
            parent.store.set('livre-grouping-style', this.groupingStyle);
            this.update(this.books);
        });

        this.sortingOrderInput.addEventListener('change', () => {
            this.sortingOrder = this.sortingOrderInput.value as SortingOrder;
            parent.store.set('livre-sorting-order', this.sortingOrder);
            this.update(this.books);
        });

        this.closeLoader.addEventListener('click', () => {
            this.currentlyLoadingBook = null;
            this.loadingOverlay.style.display = 'none';
        });
    }

    async update(books: any[]) {
        if (!books) return;

        books = books.reduce((p, n) => p.concat(n), []);

        if (books.length === 0) return;

        this.books = books;

        const sort = (books: any[]) => {
            if (this.sortingOrder === SortingOrder.BOUGHT_OLD_TO_NEW)
                return books;
            if (this.sortingOrder === SortingOrder.BOUGHT_NEW_TO_OLD)
                return Array.from(books).reverse();
            if (this.sortingOrder === SortingOrder.ALPHABETICAL_A_TO_Z)
                return Array.from(books).sort((a, b) =>
                    a.productName.localeCompare(b.productName)
                );
            if (this.sortingOrder === SortingOrder.ALPHABETICAL_Z_TO_A)
                return Array.from(books).sort((a, b) =>
                    b.productName.localeCompare(a.productName)
                );

            return books;
        };

        if (this.groupingStyle === GroupingStyle.MIXED) {
            setChildren(this.bookContainer, [
                el(
                    '.flex.items-start.flex-wrap.overflow-scroll.-mr-4',
                    ...((await Promise.all(
                        sort(books).map((book: any) =>
                            BookButton.getElement(book, this)
                        )
                    )).filter(a => a) as HTMLElement[])
                )
            ]);
        } else if (this.groupingStyle === GroupingStyle.BY_SUBJECT) {
            const booksBySubject = books.reduce(
                (p, n) => ({
                    ...p,
                    ...{
                        [n.subjectClass]: p[n.subjectClass]
                            ? [...p[n.subjectClass], n]
                            : [n]
                    }
                }),
                {}
            );
            setChildren(
                this.bookContainer,
                await Promise.all(
                    Object.keys(booksBySubject).map(async subject =>
                        el(
                            '.w-full.mb-4',
                            el(
                                'h3.tracking-wide.text-sm.text-grey-dark.uppercase.border-b.border-grey-light.py-2',
                                {
                                    style: {
                                        width: 'calc(100% - 1rem)'
                                    }
                                },
                                subject
                            ),
                            el(
                                '.pt-4.flex.items-start.flex-wrap.-mr-4',
                                ...((await Promise.all(
                                    sort(booksBySubject[subject]).map(
                                        (book: any) =>
                                            BookButton.getElement(book, this)
                                    )
                                )).filter(a => a) as HTMLElement[])
                            )
                        )
                    )
                )
            );
        }
    }
}
