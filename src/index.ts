import { mount } from 'redom';
import { App } from './app/App';

declare global {
    interface FormData {
        entries(): Iterator<[string, string | Blob]>;
    }
}

mount(document.body, new App().el);
