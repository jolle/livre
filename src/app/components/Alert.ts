import { el } from 'redom';
import { EventEmitter } from 'events';

export enum AlertLevel {
    ERROR = 'error',
    WARNING = 'warning',
    SUCCESS = 'success',
    INFO = 'info'
}

export class Alert extends EventEmitter {
    el: HTMLElement;

    constructor(
        level: AlertLevel,
        content: string | HTMLElement,
        dismissable: boolean | string = true,
        customButtons?: HTMLElement[]
    ) {
        super();

        const titles = {
            [AlertLevel.ERROR]: 'Error',
            [AlertLevel.WARNING]: 'Warning',
            [AlertLevel.SUCCESS]: 'Success',
            [AlertLevel.INFO]: 'Information'
        };
        const colors = {
            [AlertLevel.ERROR]: 'bg-red',
            [AlertLevel.WARNING]: 'bg-orange',
            [AlertLevel.SUCCESS]: 'bg-green',
            [AlertLevel.INFO]: 'bg-blue'
        };

        let dismiss: HTMLButtonElement | null = null;
        this.el = el(
            '.fixed.pin-t.pin-b.pin-r.pin-l.z-50',
            el('.absolute.pin-t.pin-r.pin-b.pin-l', {
                style: {
                    backgroundColor: 'rgba(248, 250, 252, 0.5)',
                    backdropFilter: 'blur(10px)'
                }
            }),
            el(
                '.absolute.bg-white.rounded.overflow-hidden.shadow-md',
                {
                    style: {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }
                },
                el(
                    `header.text-center.p-4.${
                        colors[level]
                    }.text-white.font-bold.uppercase.text-lg.tracking-wide`,
                    titles[level]
                ),
                el('.p-4', content),
                el(
                    '.w-full.justify-center.flex.items-center.mb-4',
                    ...(customButtons || []).map(btn =>
                        btn.className.indexOf('mr-')
                            ? btn
                            : (btn.classList.add('mr-2'), btn)
                    ),
                    ...(dismissable
                        ? [
                              (dismiss = el(
                                  `button.outline-none.mx-auto.${
                                      colors[level]
                                  }.rounded.shadow.text-white.uppercase.font-bold.text-sm.tracking-wide.block.py-3.px-6.hover:shadow-md.active:${
                                      colors[level]
                                  }-dark`,
                                  typeof dismissable === 'string'
                                      ? dismissable
                                      : 'Dismiss'
                              ) as HTMLButtonElement)
                          ]
                        : [])
                )
            )
        );

        if (dismissable && dismiss)
            dismiss.addEventListener('click', () => {
                if (this.el) this.el.remove();
                this.emit('dismiss');
            });

        (customButtons || []).forEach(btn =>
            btn.addEventListener('click', () => {
                this.emit('customButtonPress', {
                    btn,
                    dismiss: () => this.el && this.el.remove()
                });
            })
        );
    }

    static createAlert(
        level: AlertLevel,
        content: string | HTMLElement,
        dismissable: boolean | string = true,
        customButtons?: HTMLElement[]
    ) {
        const alert = new Alert(level, content, dismissable, customButtons);
        document.body.appendChild(alert.el);
        return alert;
    }
}
