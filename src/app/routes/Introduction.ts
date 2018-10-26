import { Service } from './../Service';
import { el, setChildren } from 'redom';
import { App } from '../App';

export class Introduction {
    el: HTMLElement;
    services: HTMLElement;

    parent: App;

    constructor(parent: App) {
        this.parent = parent;

        this.el = el(
            '.w-screen.h-screen.flex.items-center.justify-center.bg-grey-lightest',
            el(
                '.w-1/2',
                el('h1.text-2xl', 'Welcome to Livre!'),
                el(
                    'p.mb-4.text-sm',
                    'To get started, please connect with one of the following services.'
                ),
                (this.services = el('.'))
            )
        );
    }

    update(services: Service[]) {
        setChildren(
            this.services,
            services.map(service => {
                const btn = el(
                    '.bg-white.p-4.shadow.rounded.font-bold.text-xl.flex.hover:shadow-lg.hover:scale-10.transition-all-1/2s.cursor-pointer.active:shadow-none',
                    {
                        style: {
                            backgroundColor: service.buttonStyle.background,
                            color: service.buttonStyle.textColor
                        }
                    },
                    el('img.max-h-full.mr-4', {
                        src: service.buttonStyle.image,
                        style: {
                            maxHeight: '2rem'
                        }
                    }),
                    el('.flex.items-center.flex-grow', service.name)
                );
                btn.addEventListener('click', () => {
                    this.parent.router.update('loginScreen', {
                        fields: service.loginFields,
                        service
                    });
                });
                return btn;
            })
        );
    }
}
