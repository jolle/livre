export const getImage = (imageUrl: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageUrl;
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', () => reject());
    });

const urls = new Map<string, Promise<string>>();
const images = new Map<string, Promise<HTMLImageElement>>();

const findCover = (isbn: string): Promise<any> => {
    const promise: Promise<any> = getImage(
        `https://data.kirjavalitys.fi/data/servlets/ProductRequestServlet?action=getimage&ISBN=${isbn}`
    )
        .then(image => ({
            image,
            url: `https://data.kirjavalitys.fi/data/servlets/ProductRequestServlet?action=getimage&ISBN=${isbn}`
        }))
        .catch(() =>
            getImage(
                `https://kuvat.suomalainen.com/booksearch/productimages/${isbn.substr(
                    0,
                    2
                )}/${isbn.substr(2, 2)}/${isbn.substr(4, 2)}/${isbn.substr(
                    6
                )}_2.jpgx`
            )
                .then(image => ({
                    image,
                    url: `https://kuvat.suomalainen.com/booksearch/productimages/${isbn.substr(
                        0,
                        2
                    )}/${isbn.substr(2, 2)}/${isbn.substr(4, 2)}/${isbn.substr(
                        6
                    )}_2.jpgx`
                }))
                .catch(() =>
                    getImage(
                        `https://kuvat.suomalainen.com/booksearch/productimages/${isbn.substr(
                            0,
                            2
                        )}/${isbn.substr(2, 2)}/${isbn.substr(
                            4,
                            2
                        )}/${isbn.substr(6)}.jpgx`
                    )
                        .then(image => ({
                            image,
                            url: `https://kuvat.suomalainen.com/booksearch/productimages/${isbn.substr(
                                0,
                                2
                            )}/${isbn.substr(2, 2)}/${isbn.substr(
                                4,
                                2
                            )}/${isbn.substr(6)}.jpgx`
                        }))
                        .catch(() => null)
                )
        );
    urls.set(isbn, promise.then(r => (r ? r.url : '')));
    images.set(isbn, promise.then(r => (r ? r.image : null)));
    return promise;
};

export const findCoverImage = (isbn: string) => {
    if (images.get(isbn)) return images.get(isbn);

    return findCover(isbn).then(r => r.image);
};

const bust = Math.random();
const cacheBust = (url: string) =>
    url.indexOf('?') > -1 ? `${url}&${bust}` : `${url}?${bust}`;

export const findCoverUrl = (isbn: string) => {
    if (urls.has(isbn) && urls.get(isbn))
        return (urls.get(isbn) as Promise<string>).then(r => cacheBust(r));

    return findCover(isbn).then(r => cacheBust(r.url));
};
