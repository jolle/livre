import { Service, ServiceLoginFieldFilled } from './Service';
import { el, router, Router } from 'redom';
import Store from 'electron-store';
import { Introduction } from './routes/Introduction';
import services from './services';
import { LoginScreen } from './routes/LoginScreen';
import { Main } from './routes/Main';
import { Book } from './routes/Book';
import { Exercise } from './routes/Exercise';
import { Updater } from './Updater';
const { remote } = require('electron');

export class App {
    el: HTMLElement;
    router: Router;
    store: Store;
    services: Service[];

    constructor() {
        this.store = new Store();

        let routerContainer: HTMLElement;
        this.el = el('.', (routerContainer = el('.')), new Updater(this).el);

        this.router = router(
            routerContainer,
            {
                // @ts-ignore
                introduction: Introduction,
                // @ts-ignore
                loginScreen: LoginScreen,
                // @ts-ignore
                main: Main,
                // @ts-ignore
                book: Book,
                // @ts-ignore
                exercise: Exercise
            },
            this
        );

        this.services = services.map(a => new a());

        if (this.store.has('livre-state')) {
            this.openMain(this.store.get('livre-state'));
        } else {
            this.router.update('introduction', this.services);
        }

        window.addEventListener('error', () => {
            alert(
                'An unexpected error occured. The application will be reopened.'
            );
            remote.app.relaunch();
            remote.app.exit(0);
        });
    }

    openMain(state: any) {
        this.router.update('main');

        const services = this.services.filter(a =>
            Object.keys(state).includes(a.name)
        );
        Promise.all(services.map(a => a.loginWithState(state[a.name])));
        Promise.all(services.map(a => a.getBooks())).then(books => {
            this.router.update('main', books);
        });
    }
}
