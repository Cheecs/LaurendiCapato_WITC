const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {

    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;

}).join('');

function extractColor() {

    const colorThief = new ColorThief();
    let img = $('#imgPreview');
    let palette = {};
    let color;
    let ret = {}

    /* -- PALETTE -- */
    if (img[0].complete) {
        
        palette = colorThief.getPalette(img[0]);

    } 
    else {

        img.on('load', function () {
            palette = colorThief.getPalette(this);
        });

    }

    /* -- SINGOLO COLORE -- */
    if (img[0].complete) {

        color = colorThief.getColor(img[0]);

    } 
    else {

        img.on('load', function () {
            color = colorThief.getColor(this); 
        });

    }

    if ((palette && palette.length >= 2) || color) {

        let tempArray = Array.from(palette);
        let arrayPalette_rgb = [];
        let arrayPalette_hex = [];
        let arrayColor = Array.from(color);

        tempArray.forEach(color => {

            arrayPalette_hex.push(rgbToHex(color[0], color[1], color[2]));
            arrayPalette_rgb.push(color.join(','));
        })
        
        ret = {
            "colorRGB": color.join(','),
            "colorHEX": rgbToHex(arrayColor[0], arrayColor[1], arrayColor[2]),
            "paletteRGB": arrayPalette_rgb,
            "paletteHEX": arrayPalette_hex
        };

        return ret;

    }
}