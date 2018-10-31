import { el } from 'redom';

export class Pill {
    el: HTMLElement;

    constructor(content: string, color: number[]) {
        this.el = el(
            '.rounded-full.px-4.py-1.text-white.text-sm.font-bold.tracking-wide.uppercase.inline-block.mr-2.shadow',
            {
                style: {
                    textShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                    backgroundColor: `rgb(${color.join(',')})`
                }
            },
            content
        );
    }
}
