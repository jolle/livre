import { Alert, AlertLevel } from './../components/Alert';
import { MathEditor } from './../components/MathEditor';
import { App } from '../App';
import { el, setChildren } from 'redom';
import marked from 'marked';
import { latexToSvg } from '../helpers/MathJax';
import { parse } from 'querystring';

// @ts-ignore
import arrowLeft from '../assets/arrow-left.svg';
export class Exercise {
    el: HTMLElement;
    messageListener: EventListenerOrEventListenerObject;

    intervals: any[];

    savingContainer: HTMLElement;
    errorLastUploadedContainer: HTMLElement;
    lastUploaded: number = 0;
    shownSaveError: boolean = false;

    constructor(
        parent: App,
        {
            exercise,
            bookState,
            page
        }: { exercise: Promise<any>; bookState: any; page: any }
    ) {
        this.pendingSaves = [];
        this.intervals = [];
        let container: HTMLElement;
        let openTraditional: HTMLElement;
        let goback: HTMLElement;
        let content: HTMLElement;
        let bookmark: HTMLElement;
        this.el = el(
            '.min-h-screen.w-screen.bg-grey-lightest',
            (content = el(
                '.w-4/5.min-h-screen.bg-white.mx-auto.p-6.relative.shadow.pt-10',
                {
                    style: {
                        transition: 'padding 0.25s ease-in-out'
                    }
                },
                (bookmark = el(
                    `.w-16.h-24.border-teal-dark.absolute.pin-t.pin-r.mr-6.cursor-pointer${
                        page.isBookmarked ? '' : '.opacity-50.-mt-8'
                    }`,
                    {
                        style: {
                            borderLeftWidth: '2rem',
                            borderRightWidth: '2rem',
                            borderBottom: '2rem solid transparent',
                            transition: 'margin-top 0.12s ease-in-out'
                        }
                    }
                )),
                (openTraditional = el(
                    '.absolute.pin-t.pin-r.mt-3.text-xs.text-grey.border-b.border-transparent.cursor-pointer.hover:border-grey',
                    'not showing correctly?',
                    {
                        style: {
                            display: 'none',
                            marginRight: '6.25rem' // mr-25
                        }
                    }
                )),
                (goback = el(
                    '.rounded-full.bg-grey.hover:bg-grey-dark.cursor-pointer.text-white.text-center.leading-loose.text-lg.w-8.h-8.mb-3',
                    el('.text-white.w-6.h-6.mt-1.inline-block', {
                        style: {
                            mask: `url(${arrowLeft}) no-repeat center`,
                            webkitMask: `url(${arrowLeft}) no-repeat center`,
                            backgroundColor: '#fff'
                        }
                    })
                )),
                (container = el(
                    '.',
                    el(
                        '.flex.w-full.h-full.items-center.justify-center',
                        el('.loader')
                    )
                )),
                (this.savingContainer = el(
                    '.fixed.pin-r.mb-4.mr-4.bg-white.shadow-lg.rounded.p-3.uppercase.text-grey-darkest.tracking-wide.text-xs',
                    el('.loader-small.inline-block.align-middle.mr-2'),
                    'Saving...',
                    {
                        style: {
                            bottom: '-200px',
                            transition: 'bottom 0.5s ease-in-out'
                        }
                    }
                )),
                (this.errorLastUploadedContainer = el(
                    '.fixed.pin-l.ml-4.mb-4.bg-red.shadow-lg.rounded.p-3.uppercase.text-white.tracking-wide.text-xs',
                    'Last uploaded: never',
                    {
                        style: {
                            bottom: '-200px',
                            transition: 'bottom 0.5s ease-in-out'
                        }
                    }
                ))
            ))
        );

        goback.addEventListener('click', () => {
            parent.router.update('book', bookState);
        });

        bookmark.addEventListener('click', () => {
            const state = bookmark.classList.contains('opacity-50');

            if (state) {
                bookmark.classList.remove('opacity-50', '-mt-8');
            } else {
                bookmark.classList.add('opacity-50', '-mt-8');
            }

            bookState.book.setBookmark(page, state);
        });

        const recalculatePadding = () =>
            (document.getElementsByClassName(
                'rich-text-editor-tools'
            )[0] as HTMLElement).offsetHeight;

        let url: string = '';
        let iframe: HTMLIFrameElement | undefined;
        openTraditional.addEventListener('click', () => {
            if (!url)
                return alert('Application not ready. Try again in a moment.');
            let iframeContainer: HTMLElement;
            iframeContainer = this.el.appendChild(
                el(
                    '.absolute.pin-t.pin-b.pin-r.pin-l.pin-b.overflow-scroll.bg-white.w-4/5.mx-auto',
                    (iframe = el('iframe.border-none.w-full', {
                        src: url,
                        style: {
                            height: '100%'
                        }
                    }) as HTMLIFrameElement)
                )
            );
            iframe.addEventListener('load', () => {
                if (!iframe || !iframe.contentDocument) return;
                const element = iframe.contentDocument.getElementById(
                    'wrapper'
                );
                if (!element) return;
                element.style.maxWidth = '100%';
                element.style.width = '100%';
            });
            this.el
                .appendChild(
                    el(
                        '.rounded-full.bg-grey.hover:bg-grey-dark.cursor-pointer.text-white.text-center.leading-loose.text-lg.w-8.h-8.mb-3.absolute.pin-r.-mr-16',
                        el('.text-white.w-6.h-6.mt-1.inline-block', {
                            style: {
                                mask: `url(${arrowLeft}) no-repeat center`,
                                webkitMask: `url(${arrowLeft}) no-repeat center`,
                                backgroundColor: '#fff'
                            }
                        })
                    )
                )
                .addEventListener('click', e => {
                    if (e.target) (e.target as HTMLElement).remove();
                    if (iframe) iframe.remove();
                    if (iframeContainer) iframeContainer.remove();
                    iframe = undefined;
                });
        });

        exercise
            .then(async content => ({
                ...content,
                questions: await Promise.all(
                    (content.questions || []).map(async (a: any) => ({
                        ...a,
                        caption: await this.markdownify(a.caption),
                        clue: a.clue && (await this.markdownify(a.clue))
                    }))
                ),
                original: content
            }))
            .then(async content => {
                url = content.originalUrl;
                openTraditional.style.display = 'block';
                setChildren(container, [
                    ...(content.title
                        ? [await this.markdownify(content.title)]
                        : []),
                    ...((await Promise.all((content.questions || []).map(
                        async (sub: any) => {
                            const storeId = `livre-exercise-answer-${page.id}-${
                                sub.id
                            }`;
                            const cachedAnswer = parent.store.get(storeId);

                            let showCorrectAnswer: HTMLElement;
                            let answerContainer: HTMLElement;
                            let editor: MathEditor;
                            let recoverBtn: HTMLElement | null = null;
                            let recoverQuestionBtn: HTMLElement | null = null;
                            let recoverContainer: HTMLElement | null = null;
                            const element = el(
                                '.mt-5',
                                ...(cachedAnswer &&
                                cachedAnswer !== sub.savedAnswer &&
                                (!sub.savedAnswer ||
                                    cachedAnswer !==
                                        sub.savedAnswer.replace(/\\\\/g, '\\'))
                                    ? [
                                          (recoverContainer = el(
                                              '.flex.items-center.mb-4',
                                              (recoverBtn = el(
                                                  '.inline.cursor-pointer.bg-red.shadow.px-4.py-2.rounded.text-white.tracking-wide.uppercase.font-bold.text-sm',
                                                  'Recover Answer'
                                              )),
                                              (recoverQuestionBtn = el(
                                                  '.inline-block.text-xl.text-white.bg-grey.rounded-full.h-8.w-8.cursor-pointer.shadow.ml-2.text-center.pt-1',
                                                  '?'
                                              ))
                                          ))
                                      ]
                                    : []),
                                sub.caption,
                                (editor = new MathEditor(sub.savedAnswer)).el,
                                ...(sub.answer
                                    ? [
                                          (showCorrectAnswer = el(
                                              '.w-64.uppercase.tracking-wide.text-center.font-bold.text-white.py-3.rounded.bg-grey.shadow.my-2.cursor-pointer.hover:bg-grey-dark',
                                              'Show answer'
                                          )),
                                          (answerContainer = el(
                                              'p',
                                              { style: { display: 'none' } },
                                              await this.markdownify(sub.answer)
                                          ))
                                      ]
                                    : [])
                            );
                            if (sub.answer)
                                // @ts-ignore
                                showCorrectAnswer.addEventListener(
                                    'click',
                                    () => {
                                        if (
                                            answerContainer.style.display ===
                                            'none'
                                        ) {
                                            answerContainer.style.display =
                                                'block';
                                            showCorrectAnswer.innerHTML =
                                                'Hide answer';
                                        } else {
                                            answerContainer.style.display =
                                                'none';
                                            showCorrectAnswer.innerHTML =
                                                'Show answer';
                                        }
                                    }
                                );
                            let previous = new Date();
                            let previousValue = '';
                            editor.on(
                                'value',
                                ({
                                    answerHTML: value
                                }: {
                                    answerHTML: string;
                                }) => {
                                    if (
                                        value &&
                                        +new Date() - +previous > 1000 &&
                                        previousValue !== value
                                    ) {
                                        previousValue = value;
                                        this.pendSave(
                                            bookState.book.saveQuestion(
                                                sub,
                                                this.escape(value),
                                                content.original
                                            )
                                        );
                                    }

                                    parent.store.set(storeId, value);
                                }
                            );

                            if (recoverBtn)
                                recoverBtn.addEventListener('click', () => {
                                    let recoveredContentContainer: HTMLElement;
                                    const alert = new Alert(
                                        AlertLevel.SUCCESS,
                                        el(
                                            '.',
                                            el(
                                                'p',
                                                'We found a version of this exercise saved on this machine, but it differs from the version we found on Otava. Would you like to recover it?'
                                            ),
                                            el(
                                                '.font-bold.text-grey-darker.uppercase.text-sm.tracking-wide.my-2',
                                                'Recovered version'
                                            ),
                                            (recoveredContentContainer = el(
                                                '.rounded.bg-grey-lighter.p-2'
                                            ))
                                        ),
                                        false,
                                        [
                                            el(
                                                `button#recover.outline-none.bg-green.rounded.shadow.text-white.uppercase.font-bold.text-sm.tracking-wide.block.py-3.px-6.hover:shadow-md.active:bg-green-dark`,
                                                'Recover!'
                                            ),
                                            el(
                                                `button.ml-2.outline-none.cursor-pointer.text-grey-light.text-sm.block.border-b.border-transparent.hover:border-grey-light.h-4`,
                                                'No thanks'
                                            )
                                        ]
                                    );
                                    recoveredContentContainer.innerHTML = cachedAnswer;

                                    alert.on(
                                        'customButtonPress',
                                        ({ btn, dismiss }) => {
                                            if (recoverContainer)
                                                recoverContainer.remove();

                                            dismiss();

                                            if (btn.id && btn.id === 'recover')
                                                editor.answerBox.innerHTML = cachedAnswer;
                                        }
                                    );

                                    document.body.appendChild(alert.el);
                                });

                            if (recoverQuestionBtn)
                                recoverQuestionBtn.addEventListener(
                                    'click',
                                    () =>
                                        Alert.createAlert(
                                            AlertLevel.INFO,
                                            "Livre saves your answers on your machine temporarily. If the answer isn't uploaded online for some reason (e.g. an Internet connection failure), Livre might be able to recover the answer next time opening the exercise."
                                        )
                                );

                            return element;
                        }
                    ) as HTMLElement[])) as HTMLElement[])
                ]);
            })
            .then(() => {
                const observer = new MutationObserver(mutations => {
                    mutations.forEach(() => {
                        content.style.paddingTop = document.body.classList.contains(
                            'rich-text-editor-focus'
                        )
                            ? `${recalculatePadding() + 15}px`
                            : '';
                    });
                });

                observer.observe(document.body, {
                    attributes: true,
                    attributeFilter: ['class']
                });
                if (
                    document.getElementsByClassName('rich-text-editor-tools')[0]
                ) {
                    observer.observe(
                        document.getElementsByClassName(
                            'rich-text-editor-tools'
                        )[0],
                        {
                            attributes: true,
                            attributeFilter: ['class']
                        }
                    );
                }
            })
            .catch(e => {
                console.error(e);
                Alert.createAlert(
                    AlertLevel.ERROR,
                    "Oh no! Livre doesn't support this type of exercise (or theory page) yet. Try again later!"
                ).on('dismiss', () => {
                    parent.router.update('book', bookState);
                });
            });

        window.addEventListener(
            'message',
            (this.messageListener = (e: any) => {
                if (iframe && /^[0-9]+$/.test(e.data)) {
                    iframe.style.height = `${e.data}px`;
                }
            })
        );
    }

    onunmount() {
        window.removeEventListener('message', this.messageListener);
        this.intervals.forEach(interval => clearInterval(interval));
    }

    private stringToHTML(str: string, container?: HTMLElement) {
        if (!container) container = el('div');
        container.innerHTML = str;
        return container;
    }

    private async markdownify(str: string) {
        str = str.replace(/<\\\//g, '</'); // fixes stuff like <\/nobr>
        str = str.replace(/\\n/g, '<br/>'); // newlines to linebreaks
        str = str.replace(/\\u([0-9]{4})/g, (_, a) => JSON.parse(`"\\u${a}"`)); // unescape unicode escape codes
        str = marked(str); // use `marked` for some rudimentary markdown parsing
        str = str.replace(
            /#{2,3}<del>([^<]+)<\/del>/g, // ###~~[text]~~ is usually the big exercise number
            (_, content) =>
                `<h1 class="text-xl font-bold tracking-wide block">${content}</h1>`
        );
        str = str.replace(
            /<del><strong>([^<]+)<\/strong><\/del>/g, // ~~**[text]**~~ is usually for small question identifiers like "a)"
            (_, content) =>
                `<h2 class="text-lg font-bold inline">${content}</h1>`
        );
        str = str.replace(
            /!(image|geogebra)!\{([^}]+)\}\{([^}]+)\}/g, // special geogebra and image embeds.
            (_, type, content, raw) => {
                const attributes = parse(raw.replace(/,/g, '&'));
                if (type === 'image')
                    return `<img style="display: block; margin: 10px" src="http${content}" alt="media"${
                        attributes.w ? ` width="${attributes.w}"` : ''
                    }>`;
                if (type === 'geogebra')
                    return `<iframe src="https://tube.geogebra.org/material/iframe/id/${content}" style="border: none; width: ${
                        attributes.w
                    }px; height: ${attributes.h}px"></iframe>`;
                return '';
            }
        );
        str = str.replace(
            /([0-9]+)_([^_]+)_/g,
            (_, multiplier, variable) => `${multiplier}<i>${variable}</i>`
        );

        const svgs = await Promise.all(
            // loads values that are encased in $s to SVGs via latex
            (str.match(/\$([^$]+)\$/g) || []).map(val =>
                latexToSvg(val.slice(1, -1))
            )
        );

        str = str.replace(/\$([^$]+)\$/g, () => (svgs.shift() as string) || ''); // replaces the loaded SVGs

        return this.stringToHTML(str); // converts the string to HTML
    }

    pendingSaves: Promise<any>[];

    private pendSave(promise: Promise<any>) {
        this.pendingSaves.push(promise);

        this.savingContainer.style.bottom = '0';
        Promise.all([
            promise,
            new Promise(resolve => setTimeout(() => resolve(), 2 * 200 + 200))
        ]).then(([res]) => {
            this.pendingSaves.splice(this.pendingSaves.indexOf(promise), 1);
            if (this.pendingSaves.length === 0) {
                this.savingContainer.style.bottom = '-200px';
            }

            if (res === false) {
                this.errorLastUploadedContainer.innerHTML = `Last uploaded at ${new Date(
                    this.lastUploaded
                )
                    .toLocaleDateString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    .split(', ')
                    .pop()}`;
                this.errorLastUploadedContainer.style.bottom = '0';

                if (!this.shownSaveError) {
                    Alert.createAlert(
                        AlertLevel.ERROR,
                        'Saving the exercise answers to Otava failed. Check your internet connection or try again later.',
                        true
                    );
                    this.shownSaveError = true;
                }
            } else {
                this.errorLastUploadedContainer.style.bottom = '-200px';
                this.lastUploaded = Date.now();
                this.shownSaveError = false; // after a successful save, alert on the next unsuccessful one
            }
        });
    }

    private escape(str: string) {
        const map: any = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return str.replace(/[&<>"']/g, m => map[m]);
    }
}
