import { latexToSvg } from './../helpers/MathJax';
import { el } from 'redom';
import { EventEmitter } from 'events';
import { Alert, AlertLevel } from './Alert';
(window as any).$ = (window as any).jQuery = require('jquery');
require('mathquill/build/mathquill');
const { makeRichText } = require('rich-text-editor/dist/rich-text-editor');

export class MathEditor extends EventEmitter {
    el: HTMLElement;
    answerBox: HTMLElement;

    constructor(value: string = '') {
        super();

        this.el = el(
            '.',
            (this.answerBox = el(
                '.mt-1.w-full.resize-none.border.border-grey.p-2.rounded.outline-none.focus:border-grey-dark',
                {
                    style: {
                        minHeight: '10rem'
                    }
                }
            ))
        );

        this.answerBox.innerHTML = value;
        this.answerBox
            .querySelectorAll('img[alt][src^="data:image/svg+xml;base64,"]')
            .forEach(mathObject => {
                const alt = mathObject.attributes.getNamedItem('alt');
                if (
                    alt &&
                    alt.value.indexOf('\\\\') > -1 &&
                    mathObject instanceof HTMLImageElement
                ) {
                    mathObject.alt = alt.value.replace(/\\\\/g, '\\');
                }
            });

        this.answerBox
            .querySelectorAll('math.wrs_highschool')
            .forEach(wiris =>
                wiris.addEventListener('click', () =>
                    Alert.createAlert(
                        AlertLevel.WARNING,
                        "This math object was created using the Wiris editor on Cloubi. Livre doesn't support Wiris and as such you cannot modify the object. Please remove and rewrite the object using Livre's editor in order to use it again.",
                        true
                    )
                )
            );

        makeRichText(
            this.answerBox,
            {
                screenshot: {},
                baseUrl: 'https://math-demo.abitti.fi',
                updateMathImg: ($img: any, latex: any) => {
                    latexToSvg(latex).then((svg: any) => {
                        $img.prop({
                            src: `data:image/svg+xml;base64,${window.btoa(
                                svg
                            )}`,
                            alt: latex
                        });
                        $img.closest('[data-js="answer"]').trigger('input');
                    });
                }
            },
            (t: any) => this.emit('value', t)
        );

        // removing broken event handler
        $(this.answerBox).off(
            'paste',
            (jQuery as any)._data(this.answerBox, 'events').paste[0].handler
        );
        $(this.answerBox).off(
            'drop',
            (jQuery as any)._data(this.answerBox, 'events').drop[0].handler
        );

        // fixed paste event handler
        this.answerBox.addEventListener('paste', e => {
            if (e.clipboardData.files.length > 0) {
                e.stopPropagation();
                e.preventDefault();
                Promise.all(
                    Array.from(e.clipboardData.files).map(file =>
                        this.readDataAsUrl(file)
                    )
                ).then(files => {
                    files.forEach(url =>
                        window.document.execCommand(
                            'insertHTML',
                            false,
                            el('img', {
                                src: url
                            }).outerHTML
                        )
                    );
                });
            }
        });
        // fixed drop event handler
        this.answerBox.addEventListener('drop', e => {
            if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                Promise.all(
                    Array.from(e.dataTransfer.files).map(file =>
                        this.readDataAsUrl(file)
                    )
                ).then(files => {
                    files.forEach(url =>
                        window.document.execCommand(
                            'insertHTML',
                            false,
                            el('img', {
                                src: url
                            }).outerHTML
                        )
                    );
                });
            } else if (e.dataTransfer) {
                const data = e.dataTransfer.getData('text/html');
                if (data && data.indexOf('<img ') > -1) {
                    e.preventDefault();
                    Array.from(
                        new DOMParser()
                            .parseFromString(data, 'text/html')
                            .getElementsByTagName('img')
                    )
                        .map(img => img.src)
                        .forEach(url =>
                            window.document.execCommand(
                                'insertHTML',
                                false,
                                el('img', {
                                    src: url
                                }).outerHTML
                            )
                        );
                }
            }
        });
    }

    // @deprecated
    getValue() {
        const tmp = document.createElement('div');
        tmp.innerHTML = this.answerBox.innerHTML;
        tmp.querySelectorAll(
            'img[alt][src^="data:image/svg+xml;base64,"]'
        ).forEach(img => {
            img.setAttribute(
                'onclick',
                "!window.isLivre&&alert&&alert('You cannot edit this math object outside of Livre. Please open this exercise in Livre in order to edit it.')"
            );
        });

        const html = tmp.innerHTML;
        tmp.remove();

        return html;
    }

    private readDataAsUrl(data: any) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.addEventListener(
                'load',
                e => e && e.target && resolve((e.target as any).result)
            );
            reader.readAsDataURL(data);
        });
    }
}
