import { el } from 'redom';
import { App } from '../App';

// @ts-ignore
import chevronRight from '../assets/chevron-right.svg';
// @ts-ignore
import arrowLeft from '../assets/arrow-left.svg';
import { IS_MAC } from '../constants';

export class Book {
    el: HTMLElement;
    book: any;

    goBackButton: HTMLElement;

    constructor(parent: App, { pages, book }: { pages: any[]; book: any }) {
        this.book = book;

        this.el = el(
            `.bg-grey-lightest.p-4.pt-${
                IS_MAC ? '12' : '4'
            }.w-screen.h-screen.overflow-scroll`,
            (this.goBackButton = el(
                '.rounded-full.bg-grey.hover:bg-grey-dark.cursor-pointer.text-white.text-center.leading-loose.text-lg.w-8.h-8.mb-3',
                el('.text-white.w-6.h-6.mt-1.inline-block', {
                    style: {
                        mask: `url(${arrowLeft}) no-repeat center`,
                        webkitMask: `url(${arrowLeft}) no-repeat center`,
                        backgroundColor: '#fff'
                    }
                })
            )),
            el(
                'ul.list-reset',
                pages.filter(page => page.level === 'top').map(page =>
                    this.makeExpandableList(
                        `${page.number ? `${page.number} ` : ''}${page.title}`,
                        pages
                            .filter(
                                middlePage =>
                                    middlePage.level === 'middle' &&
                                    page.children.includes(middlePage.id)
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
                                                bottomPage.level === 'bottom' &&
                                                middlePage.children.includes(
                                                    bottomPage.id
                                                )
                                        )
                                        .map(bottomPage => {
                                            let bookmark: HTMLElement;
                                            const listElement = el(
                                                'li.my-2',
                                                (bookmark = el(
                                                    `.rounded-full.border-2.border-grey-light.w-4.h-4.inline-block.mr-2.align-top.cursor-pointer${
                                                        bottomPage.isBookmarked
                                                            ? '.bg-grey-light'
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

                                                    const state = !bookmark.classList.contains(
                                                        'bg-grey-light'
                                                    );
                                                    if (state)
                                                        bookmark.classList.add(
                                                            'bg-grey-light'
                                                        );
                                                    else
                                                        bookmark.classList.remove(
                                                            'bg-grey-light'
                                                        );

                                                    book.setBookmark(
                                                        bottomPage,
                                                        state
                                                    );
                                                }
                                            );
                                            listElement.addEventListener(
                                                'click',
                                                () => {
                                                    parent.router.update(
                                                        'exercise',
                                                        {
                                                            exercise: book.getExercise(
                                                                bottomPage
                                                            ),
                                                            bookState: {
                                                                pages,
                                                                book
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
        );
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
                const start = Date.now();
                const handler = () => {
                    childrenElement.removeEventListener(
                        'transitionend',
                        handler
                    );
                    if (Date.now() - start > 300 * 1.25) return; // 25% margin
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
