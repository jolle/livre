import { el, setChildren, svg } from 'redom';
import { App } from './App';
import AdmZip from 'adm-zip';
import semver from 'semver';
const { remote } = require('electron');

export class Updater {
    el: HTMLElement;
    updateInformation: any;
    parent: App;

    constructor(parent: App) {
        this.updateInformation = {};
        this.parent = parent;

        let changelog: HTMLLinkElement;
        let cancel: HTMLElement;
        let upgrade: HTMLElement;
        let skipVersion: HTMLElement;
        this.el = el(
            '.bg-white.w-screen.h-screen.absolute.pin-t.pin-b.pin-r.pin-l.text-black.flex.justify-center.items-center',
            {
                style: {
                    display: 'none' //'flex'
                }
            },
            el(
                '.text-center',
                el('.font-bold.text-3xl', 'An update is available'),
                el(
                    'p.my-3.w-2/3.mx-auto',
                    'A new software update for Livre is available. ',
                    (changelog = el(
                        'a.text-black.border-b.border-black.hover:text-grey-darker.cursor-pointer',
                        'View the changelog here.'
                    ) as HTMLLinkElement),
                    ' Would you like to upgrade?'
                ),
                el(
                    '.flex.mx-auto.justify-center.items-center.mb-5',
                    (cancel = el(
                        '.text-grey-dark.mr-4.text-sm.cursor-pointer.hover:border-grey-dark.border-b.border-transparent.outline-none',
                        'Cancel'
                    )),
                    (upgrade = el(
                        'button.bg-green-dark.text-white.py-3.px-5.rounded.hover:shadow.outline-none.text-xl.font-bold',
                        'Upgrade'
                    ))
                ),
                (skipVersion = el(
                    'a.text-grey-dark.border-b.border-transparent.hover:border-grey-dark.cursor-pointer.text-xs.uppercase.tracking-wide',
                    'Skip this version'
                ))
            )
        );

        cancel.addEventListener('click', () => {
            this.el.style.display = 'none';
        });
        skipVersion.addEventListener('click', () => {
            if (this.updateInformation.version)
                parent.store.set(
                    'livre-skipped-version',
                    this.updateInformation.version
                );
            this.el.style.display = 'none';
        });
        changelog.addEventListener('click', () => {
            if ((this.updateInformation.changelog || '').startsWith('http:'))
                return remote.shell.openExternal(
                    this.updateInformation.changelog
                );

            let close: HTMLElement;
            let content: HTMLElement;
            const elem = this.el.appendChild(
                el(
                    '.fixed.pin-t.pin-b.pin-r.pin-l.flex.items-center.justify-center',
                    {
                        style: {
                            backgroundColor: 'rgba(248, 250, 252, 0.5)',
                            backdropFilter: 'blur(10px)'
                        }
                    },
                    el(
                        '.bg-white.rounded.shadow.p-8.text-center.relative.w-1/2',
                        { style: { minHeight: '25vh' } },
                        (close = el(
                            '.absolute.pin-t.pin-r.bg-white.p-2.rounded.cursor-pointer.font-bold.text-lg',
                            '×'
                        )),
                        (content = el('.'))
                    )
                )
            );

            close.addEventListener('click', () => {
                elem.remove();
            });
            content.innerHTML =
                this.updateInformation.changelog ||
                'Sorry! The changelog is currently unavailable. Try again later!';
        });
        upgrade.addEventListener('click', () => {
            this.upgrade();
        });
        this.checkForUpdates();
    }

    private checkForUpdates() {
        fetch('https://livre-updates.jolle.io/latest.json')
            .then(r => r.json())
            .then(data => {
                if (
                    semver.gt(data.version, require('package.json').version) &&
                    (!this.parent.store.has('livre-skipped-version') ||
                        semver.gt(
                            data.version,
                            this.parent.store.get('livre-skipped-version')
                        ))
                ) {
                    this.updateInformation = data;
                    this.el.style.display = 'block';
                }
            });
    }

    private upgrade() {
        if (!this.updateInformation || !this.updateInformation.download)
            throw Error('Unable to find update download target.');

        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.updateInformation.download);
        setChildren(this.el, [el('.loader')]);
        xhr.addEventListener('progress', e => {
            setChildren(this.el, [this.getProgressCircle(e.loaded / e.total)]);
        });
        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState !== 4) return;
            setChildren(this.el, [el('.loader')]);
            // @ts-ignore
            const admZip = new AdmZip(xhr.response);
            admZip.extractAllTo(__dirname, true);
            remote.app.relaunch();
            remote.app.exit(0);
        });
        xhr.send();
    }

    private getProgressCircle(percentage: number) {
        return svg(
            'svg',
            {
                width: '80px',
                height: '80px',
                viewBox: '0 0 120 120',
                style: {
                    transform: 'rotate(-90deg)'
                }
            },
            svg('circle', {
                cx: '60',
                cy: '60',
                r: '54',
                strokeWidth: '12',
                style: {
                    fill: 'none',
                    stroke: '#f8fafc'
                }
            }),
            svg('circle', {
                cx: '60',
                cy: '60',
                r: '54',
                strokeWidth: '12',
                style: {
                    fill: 'none',
                    'stroke-dashoffset': (1 - percentage) * 2 * Math.PI * 54,
                    stroke: '#dae1e7'
                }
            })
        );
    }
}
