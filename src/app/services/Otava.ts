import { Service, ServiceLoginField } from './../Service';
import { OtavaDigikirja } from 'otava-digikirja-api';

export class Otava implements Service {
    name = 'Otava – Opiskelijan maailma';
    buttonStyle = {
        image:
            'https://kuvat.otava.fi/400x0/logot/otava-oppimisen-palvelut-logo.png',
        background: '#fff'
    };
    loginFields: ServiceLoginField[] = [
        {
            type: 'text',
            name: 'username',
            placeholder: 'Username or E-mail'
        },
        {
            type: 'password',
            name: 'password',
            placeholder: 'Password'
        }
    ];

    instance: OtavaDigikirja;
    hasLoggedIn: boolean;

    constructor() {
        this.instance = new OtavaDigikirja();
        this.hasLoggedIn = false;
    }

    getBooks() {
        return this.instance.getBooks();
    }

    async loginWithFields({
        username,
        password
    }: {
        username: string;
        password: string;
    }) {
        if (this.hasLoggedIn) return { username, password };

        await this.instance.login(username, password);

        this.hasLoggedIn = true;

        return { username, password };
    }

    async loginWithState(state: any) {
        if (this.hasLoggedIn) return true;

        const {
            username,
            password
        }: { username: string; password: string } = state;

        await this.instance.login(username, password);

        this.hasLoggedIn = true;

        return true;
    }
}
