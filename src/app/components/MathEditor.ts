import { latexToSvg } from './../helpers/MathJax';
import { el } from 'redom';
import { EventEmitter } from 'events';
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
            .querySelectorAll('math.wrs_highschool')
            .forEach(wiris =>
                wiris.addEventListener('click', () =>
                    alert(
                        "This math object has been written using the Cloubi Wiris editor which isn't supported by Livre. Either remove this object and replace it with a new Livre math object or edit the object on Cloubi."
                    )
                )
            );

        makeRichText(
            this.answerBox,
            {
                screenshot: {
                    saver: (...args: any[]) => {
                        console.log(args);
                    },
                    limit: 10
                },
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
}
