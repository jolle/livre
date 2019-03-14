import { el } from 'redom';
require('mathjax');
const he = require('he');

MathJax.Hub.Config({
    jax: ['input/TeX', 'output/SVG'],
    extensions: [
        'toMathML.js',
        'tex2jax.js',
        'MathMenu.js',
        'MathZoom.js',
        'fast-preview.js',
        'AssistiveMML.js',
        'a11y/accessibility-menu.js'
    ],
    TeX: {
        extensions: [
            'AMSmath.js',
            'AMSsymbols.js',
            'noErrors.js',
            'noUndefined.js',
            'mhchem.js'
        ]
    },
    SVG: {
        useFontCache: true,
        useGlobalCache: false,
        EqnChunk: 1000000,
        // @ts-ignore
        EqnDelay: 0,
        font: 'STIX-Web'
    },
    messageStyle: 'none'
});
// @ts-ignore
MathJax.Ajax.config.root = __dirname + `/../node_modules/mathjax`;

const resultBox = el('.', '\\({}\\)', { style: { display: 'none' } });
document.body.appendChild(resultBox);
MathJax.Hub.Queue(() => {
    MathJax.Hub.getAllJax(resultBox)[0];
});

let math: any;
MathJax.Hub.queue.Push(() => {
    math = MathJax.Hub.getAllJax('MathOutput')[0];
});

export const latexToSvg = (latex: string) =>
    new Promise(resolve => {
        MathJax.Hub.queue.Push([
            'Text',
            math,
            '\\displaystyle{' + he.decode(latex) + '}'
        ]);
        MathJax.Hub.Queue(() => {
            const svg = resultBox.querySelector('svg');
            if (!svg) {
                return resolve(latex);
            }

            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            svg.querySelectorAll('use').forEach(element => {
                if (element.outerHTML.indexOf('xlmns:xlink'))
                    element.setAttribute(
                        'xmlns:xlink',
                        'http://www.w3.org/1999/xlink'
                    );
            });

            resolve(
                svg.outerHTML
                    .replace(' xlink=', ' xmlns:xlink=')
                    .replace(/ ns\d+:href/gi, ' xlink:href')
            );
        });
    });
