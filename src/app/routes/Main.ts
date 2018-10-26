import { MathEditor } from './../components/MathEditor';
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
            '.p-4.pb-0.pt-10.bg-grey-lightest.w-screen.h-screen.overflow-scroll',
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
                '.mr-4.text-grey-dark.inline-block.w-64',
                el('h4.text-xs.tracking-wide.uppercase.mb-1', 'Grouping style'),
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
                el('h4.text-xs.tracking-wide.uppercase.mb-1', 'Sorting order'),
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
            ),
            (this.bookContainer = el(
                '.relative.pt-4.flex.items-start.flex-wrap.overflow-scroll.-mr-4',
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

    /*
    amount
    9999999
classLevel
:
""
frontCoverURL
:
"https://data.kirjavalitys.fi/data/servlets/ProductRequestServlet?action=getimage&ISBN=9789511295433"
getBook
:
ƒ ()
id
:
"9789511295433"
materialStorage
:
null
materialType
:
"UNDEFINED"
materialTypeClass
:
null
merchantId
:
null
organizationId
:
null
organizationName
:
""
productId
:
"9789511295433"
productName
:
"Juuri 2 digikirja (ONLINE, 48 kk)"
productType
:
"HTML"
publicationYear
:
2016
publisherId
:
"73074"
schoolSubject
:
null
specifier
:
"LISENSSI 48 KK"
subjectClass
:
"Matematiikka"
subjectSeries
:
"Juuri"
summary
:
"Ostaessasi digikirjan saat linkin ja käyttöön oikeuttavan koodin sähköpostiisi. Tuotteen käyttöoikeus on voimassa 48 kk aktivointipäivästä. Tuotteella on 14 vrk:n palautusoikeus, jos tuotetta ei ole aktivoitu. Digikirja toimii HTML5-formaattia tukevilla selaimilla ja laitteilla."
type
:
"NAMED"
validFrom
:
"2017-09-27"
validTo
:
"2021-09-27"
validToString
:
"27.09.2021"
*/
    update(books: any[]) {
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
                    '.pt-4.flex.items-start.flex-wrap.overflow-scroll.-mr-4',
                    ...sort(books).map((book: any) => this.makeBook(book))
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
                Object.keys(booksBySubject).map(subject =>
                    el(
                        '.w-full.mb-4',
                        el(
                            'h3.tracking-wide.text-sm.text-grey-dark.uppercase.border-b.border-grey-light.py-4',
                            {
                                style: {
                                    width: 'calc(100% - 1rem)'
                                }
                            },
                            subject
                        ),
                        el(
                            '.pt-4.flex.items-start.flex-wrap.-mr-4',
                            ...sort(booksBySubject[subject]).map((book: any) =>
                                this.makeBook(book)
                            )
                        )
                    )
                )
            );
        }
    }

    private makeBook(book: any) {
        const bookElement = el(
            '.bg-white.p-4.rounded.shadow.mb-4.mr-4.h-1/3.cursor-pointer.hover:shadow-md.hover:scale-10.transition-all-1/2s',
            {
                style: {
                    width: `${window.innerWidth / 3 - 24}px`
                }
            },
            el('img.block.rounded.bg-grey-light.h-32.mb-4.mx-auto', {
                src: book.frontCoverURL
            }),
            el(
                '.h-12',
                el('h2.text-sm.font-bold.text-center', book.productName)
            )
        );

        bookElement.addEventListener('click', () => {
            this.currentlyLoadingBook = book.id;
            this.loadingOverlay.style.display = 'block';

            book.getBook().then((actualBook: any) => {
                if (
                    this.currentlyLoadingBook === null ||
                    this.currentlyLoadingBook !== book.id
                )
                    return; // loading has been cancelled
                actualBook.getPages().then((pages: any) => {
                    if (
                        this.currentlyLoadingBook === null ||
                        this.currentlyLoadingBook !== book.id
                    )
                        return; // loading has been cancelled
                    this.parent.router.update('book', {
                        pages,
                        book: actualBook
                    });
                });
            });
        });

        return bookElement;
    }
}
