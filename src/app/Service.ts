export interface ServiceLoginField {
    type: 'text' | 'password';
    name: string;
    placeholder: string;
}

export interface ServiceLoginFieldFilled {
    [name: string]: string;
}

export interface ServiceButtonStyle {
    background?: string;
    textColor?: string;
    image?: string;
}

export interface Service {
    name: string;
    buttonStyle: ServiceButtonStyle;
    loginFields: ServiceLoginField[];

    loginWithFields(fields: ServiceLoginFieldFilled): Promise<any>;
    loginWithState(state: string): Promise<boolean>;
    getBooks(): Promise<any[]>;
}
