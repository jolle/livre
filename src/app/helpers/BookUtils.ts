import { findCoverUrl, getImage } from './CoverFinder';
import { Main } from './../routes/Main';
import axios from 'axios';

export const getBookBackground = async (book: any) => {
    const cloubiBackground = `https://cloubi.otava.fi/html/cloubi/edge/product-themes/Otava${stripBookName(
        book.productName
    ).replace(/\s/g, '')}ProductTheme/img/period_background.jpg`;
    const { status } = await axios.head(cloubiBackground, {
        validateStatus: () => true
    });
    if (status === 200) return cloubiBackground;

    return await findCoverUrl(book.id);
};

export const stripBookName = (name: string) => {
    //const duration = (name.match(/([0-9]+) kk/) || [])[1];

    name = name.replace(
        /\s-\s[A-Z]+[0-9]+\s[^:]+\s?:?\s?yhden käyttäjän lisenssi/g,
        ''
    );
    name = name.replace(/\s-\s[A-Z]+[0-9]+/g, '');
    name = name.replace(/\s?(:|-)?\s?yhden käyttäjän lisenssi/gi, '');
    name = name.replace(/\s?ONL(INE)?/g, '');
    name = name.replace(/\s?\([^)]+\)/g, '');
    name = name.replace(/\s?digikirja/g, '');
    name = name.replace(/\s?[0-9]+ kk/g, '');
    name = name.trim();

    return name;
};
