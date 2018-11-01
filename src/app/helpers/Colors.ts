const dominant = require('huey/dominant');

export const getDominantColor = (image: HTMLImageElement) => {
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = image.width;
    tmpCanvas.height = image.height;
    const ctx = tmpCanvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    const { data } = ctx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);

    return dominant(data) || [0, 0, 0];
};
