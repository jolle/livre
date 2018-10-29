import { el } from 'redom';
require('mathjax');

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
        MathJax.Hub.queue.Push(['Text', math, '\\displaystyle{' + latex + '}']);
        MathJax.Hub.Queue(() => {
            const svg = resultBox.querySelector('svg');
            if (!svg)
                return resolve(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
            <svg width="17px" height="15px" viewBox="0 0 17 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <title>Group 2</title>
                <defs></defs>
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g transform="translate(-241.000000, -219.000000)">
                        <g transform="translate(209.000000, 207.000000)">
                            <rect x="-1.58632797e-14" y="0" width="80" height="40"></rect>
                            <g transform="translate(32.000000, 12.000000)">
                                <polygon id="Combined-Shape" fill="#9B0000" fill-rule="nonzero" points="0 15 8.04006 0 16.08012 15"></polygon>
                                <polygon id="Combined-Shape-path" fill="#FFFFFF" points="7 11 9 11 9 13 7 13"></polygon>
                                <polygon id="Combined-Shape-path" fill="#FFFFFF" points="7 5 9 5 9 10 7 10"></polygon>
                            </g>
                        </g>
                    </g>
                </g>
            </svg>`);

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
