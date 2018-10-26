import { App } from './../App';
import { ServiceLoginField, Service } from './../Service';
import { el, setChildren } from 'redom';

export class LoginScreen {
    el: HTMLElement;
    form: HTMLFormElement;
    currentService: Service | null;

    constructor(parent: App) {
        this.currentService = null;

        this.el = el(
            '.w-screen.h-screen.flex.items-center.justify-center.bg-grey-lightest',
            (this.form = el(
                'form.bg-white.p-6.rounded.shadow.w-1/2'
            ) as HTMLFormElement)
        );

        this.form.addEventListener('submit', e => {
            e.preventDefault();

            if (!this.currentService)
                return alert(
                    'Oh no! Something very unexpected happened. Please restart the application.'
                );

            const loginData = Array.from(
                // @ts-ignore
                new FormData(this.form).entries()
            ).reduce((p: any, n: any[]) => ({ ...p, [n[0]]: n[1] }), {});

            this.currentService
                .loginWithFields({
                    username: loginData.username,
                    password: loginData.password
                })
                .then(() => {
                    if (!this.currentService)
                        return alert(
                            'Oh no! Something very unexpected happened. Please restart the application.'
                        );
                    parent.store.set('livre-state', {
                        ...(parent.store.get('livre-state') || {}),
                        [this.currentService.name]: loginData
                    });
                    parent.openMain(parent.store.get('livre-state'));
                })
                .catch(() => {
                    alert('Incorrect username or password.'); // TODO: make this prettier
                });
        });
    }

    update({
        fields,
        service
    }: {
        fields: ServiceLoginField[];
        service: Service;
    }) {
        this.currentService = service;
        setChildren(this.form, [
            ...fields.map(field =>
                el(
                    'input.mb-4.text-sm.w-full.outline-none.py-2.px-3.block.border.border-grey-light.bg-grey-lighter.rounded',
                    {
                        type: field.type,
                        placeholder: field.placeholder,
                        name: field.name
                    }
                )
            ),
            el(
                'input.bg-grey-lightest.rounded.shadow.p-3.w-full.tracking-wide.uppercase.text-sm.font-bold.text-grey-darker.outline-none',
                {
                    type: 'submit',
                    value: 'Log in'
                }
            )
        ]);
    }
}
