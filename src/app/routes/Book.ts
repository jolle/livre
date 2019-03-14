import { Alert, AlertLevel } from './../components/Alert';
import { el, setChildren } from 'redom';
import { App } from '../App';

// @ts-ignore
import chevronRight from '../assets/chevron-right.svg';
// @ts-ignore
import arrowLeft from '../assets/arrow-left.svg';
// @ts-ignore
import download from '../assets/download.svg';
import { IS_MAC } from '../constants';

export class Book {
    el: HTMLElement = el('.');
    parent: App;
    book: any;

    goBackButton?: HTMLElement;
    importExerciseListButton?: HTMLElement;

    exerciseList: string[] = [];

    constructor(parent: App) {
        this.parent = parent;
    }

    update({
        pages,
        book,
        bookSkeleton
    }: {
        pages: any[];
        book: any;
        bookSkeleton: any;
    }) {
        this.book = book;

        const storeId = `livre-book-exercise-list-${bookSkeleton.id}`;

        this.exerciseList = this.parent.store.get(storeId) || [];

        setChildren(this.el, [
            el(
                `.bg-grey-lightest.p-4.pt-${
                    IS_MAC ? '12' : '4'
                }.w-screen.h-screen.overflow-scroll`,
                (this.goBackButton = el(
                    '.rounded-full.inline-block.mr-2.bg-grey.hover:bg-grey-dark.cursor-pointer.text-white.text-center.leading-loose.text-lg.w-8.h-8.mb-3',
                    el('.text-white.w-6.h-6.mt-1.inline-block', {
                        style: {
                            mask: `url(${arrowLeft}) no-repeat center`,
                            webkitMask: `url(${arrowLeft}) no-repeat center`,
                            backgroundColor: '#fff'
                        }
                    })
                )),
                (this.importExerciseListButton = el(
                    '.rounded-full.inline-block.bg-grey.hover:bg-grey-dark.cursor-pointer.text-white.text-center.leading-loose.text-lg.w-8.h-8.mb-3',
                    el('.text-white.w-6.h-6.mt-1.inline-block', {
                        style: {
                            mask: `url(${download}) no-repeat center`,
                            webkitMask: `url(${download}) no-repeat center`,
                            webkitMaskSize: '85%',
                            backgroundColor: '#fff'
                        }
                    })
                )),
                el(
                    'ul.list-reset',
                    pages
                        .filter(page => page.level === 'top')
                        .map(page =>
                            this.makeExpandableList(
                                `${page.number ? `${page.number} ` : ''}${
                                    page.title
                                }`,
                                pages
                                    .filter(
                                        middlePage =>
                                            middlePage.level === 'middle' &&
                                            page.children.includes(
                                                middlePage.id
                                            )
                                    )
                                    .map(middlePage =>
                                        this.makeExpandableList(
                                            `${
                                                middlePage.number
                                                    ? `${middlePage.number} `
                                                    : ''
                                            }${middlePage.title}`,
                                            pages
                                                .filter(
                                                    bottomPage =>
                                                        bottomPage.level ===
                                                            'bottom' &&
                                                        middlePage.children.includes(
                                                            bottomPage.id
                                                        )
                                                )
                                                .map(bottomPage => {
                                                    let bookmark: HTMLElement;
                                                    const isInList = this.exerciseList.includes(
                                                        (bottomPage.title.match(
                                                            /([1-9][0-9]{2})/
                                                        ) || [])[1]
                                                    );
                                                    const listElement = el(
                                                        'li.my-2',
                                                        (bookmark = el(
                                                            `.rounded-full.border-2${
                                                                isInList
                                                                    ? bottomPage.isBookmarked
                                                                        ? '.border-green-light'
                                                                        : '.border-orange-light'
                                                                    : '.border-grey-light'
                                                            }.w-4.h-4.inline-block.mr-2.align-top.cursor-pointer${
                                                                bottomPage.isBookmarked
                                                                    ? isInList
                                                                        ? '.bg-green-light'
                                                                        : '.bg-grey-light'
                                                                    : ''
                                                            }`,
                                                            {
                                                                style: {
                                                                    /*borderRightColor:
                                                                '#ffed4a',
                                                            borderBottomColor:
                                                                '#ffed4a',*/
                                                                    transform:
                                                                        'rotate(-45deg)'
                                                                }
                                                            }
                                                        )),
                                                        `${
                                                            bottomPage.number
                                                                ? `${
                                                                      bottomPage.number
                                                                  } `
                                                                : ''
                                                        }${bottomPage.title}`
                                                    );

                                                    bookmark.addEventListener(
                                                        'click',
                                                        e => {
                                                            e.stopPropagation();
                                                            e.preventDefault();

                                                            const state = !bottomPage.isBookmarked;
                                                            if (state) {
                                                                if (isInList) {
                                                                    bookmark.classList.add(
                                                                        'border-green-light',
                                                                        'bg-green-light'
                                                                    );
                                                                    bookmark.classList.remove(
                                                                        'border-orange-light',
                                                                        'border-grey-light'
                                                                    );
                                                                } else {
                                                                    bookmark.classList.add(
                                                                        'bg-grey-light'
                                                                    );
                                                                }
                                                            } else {
                                                                if (isInList) {
                                                                    bookmark.classList.remove(
                                                                        'bg-grey-light',
                                                                        'border-green-light',
                                                                        'bg-green-light'
                                                                    );
                                                                    bookmark.classList.add(
                                                                        'border-orange-light'
                                                                    );
                                                                } else {
                                                                    bookmark.classList.remove(
                                                                        'bg-grey-light',
                                                                        'border-green-light',
                                                                        'bg-green-light'
                                                                    );
                                                                }
                                                            }

                                                            bottomPage.isBookmarked = state;

                                                            book.setBookmark(
                                                                bottomPage,
                                                                state
                                                            );
                                                        }
                                                    );
                                                    listElement.addEventListener(
                                                        'click',
                                                        () => {
                                                            this.parent.router.update(
                                                                'exercise',
                                                                {
                                                                    exercise: book.getExercise(
                                                                        bottomPage
                                                                    ),
                                                                    bookState: {
                                                                        pages,
                                                                        book,
                                                                        bookSkeleton
                                                                    },
                                                                    page: bottomPage
                                                                }
                                                            );
                                                        }
                                                    );

                                                    return listElement;
                                                })
                                        )
                                    )
                            )
                        )
                )
            )
        ]);

        this.goBackButton.addEventListener('click', () => {
            this.parent.openMain(this.parent.store.get('livre-state'));
        });

        this.importExerciseListButton.addEventListener('click', () => {
            let doImport: HTMLElement;
            let cancel: HTMLElement;
            let content: HTMLTextAreaElement;
            const alert = new Alert(
                AlertLevel.INFO,
                (content = el(
                    'textarea.w-64.h-32.border-grey.border..rounded'
                ) as HTMLTextAreaElement),
                false,
                [
                    (doImport = el(
                        '.inline.mr-2.cursor-pointer.bg-blue.shadow.px-4.py-2.rounded.text-white.tracking-wide.uppercase.font-bold.text-sm',
                        'Import'
                    )),
                    (cancel = el(
                        '.text-xs.text-grey.border-b.border-transparent.cursor-pointer.hover:border-grey',
                        'Cancel'
                    ))
                ]
            );

            cancel.addEventListener('click', () => {
                alert.el.remove();
            });

            doImport.addEventListener('click', () => {
                alert.el.remove();

                this.exerciseList =
                    content.value.match(/([1-9][0-9]{2})/g) || [];

                this.parent.store.set(storeId, this.exerciseList);

                this.update({ pages, book, bookSkeleton });
            });

            document.body.appendChild(alert.el);
        });
    }

    private makeExpandableList(header: string, children: HTMLElement[]) {
        let headerElement;
        let headerStateIcon: HTMLImageElement;
        let childrenElement: HTMLElement;
        let open = false;
        const list = el(
            'li',
            (headerElement = el(
                'span',
                (headerStateIcon = el('img.mr-2.align-bottom', {
                    src: chevronRight,
                    height: '10px',
                    style: {
                        transition: 'transform 0.2s ease-in-out'
                    }
                }) as HTMLImageElement),
                header
            )),
            (childrenElement = el(
                'ul.list-reset.ml-4.overflow-hidden',
                {
                    style: {
                        height: '0',
                        transition: 'height 0.3s ease-in-out'
                    }
                },
                ...children
            ))
        );

        headerElement.addEventListener('click', () => {
            open = !open;

            if (open) {
                const handler = () => {
                    childrenElement.removeEventListener(
                        'transitionend',
                        handler
                    );
                    childrenElement.style.height = 'auto';
                };
                childrenElement.addEventListener('transitionend', handler);
                headerStateIcon.style.transform = 'rotate(90deg)';
                childrenElement.style.height =
                    childrenElement.scrollHeight + 'px';
            } else {
                childrenElement.style.height =
                    childrenElement.scrollHeight + 'px';
                headerStateIcon.style.transform = '';
                requestAnimationFrame(
                    () => (childrenElement.style.height = '0')
                );
            }
        });

        return list;
    }
}
