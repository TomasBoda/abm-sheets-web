// Jest mock for the ESM-only "compostjs" package
// Exposes named exports { compost, scale } used in the codebase.

const makeShape = (type, payload = {}) => ({
    __mockShape: true,
    type,
    ...payload,
});

const scale = {
    continuous: (min, max) => ({
        __mockScale: true,
        kind: "continuous",
        min,
        max,
    }),
    categorical: (names) => ({ __mockScale: true, kind: "categorical", names }),
};

const compost = {
    text: (x, y, content, font, color) =>
        makeShape("TEXT", { x, y, content, font, color }),
    bubble: (point, height, width) =>
        makeShape("BUBBLE", { point, height, width }),
    shape: (points) => makeShape("SHAPE", { points }),
    line: (points) => makeShape("LINE", { points }),
    column: (name, size) => makeShape("COLUMN", { name, size }),
    bar: (size, name) => makeShape("BAR", { size, name }),
    fillColor: (color, shape) => makeShape("FILLCOLOR", { color, shape }),
    strokeColor: (color, shape) => makeShape("STROKECOLOR", { color, shape }),
    font: (font, color, shape) => makeShape("FONT", { font, color, shape }),
    nest: (x1, x2, y1, y2, shape) =>
        makeShape("NEST", { x1, x2, y1, y2, shape }),
    nestX: (start, end, shape) => makeShape("NESTX", { start, end, shape }),
    nestY: (start, end, shape) => makeShape("NESTY", { start, end, shape }),
    scale: (sx, sy, shape) => makeShape("SCALE", { sx, sy, shape }),
    scaleX: (s, shape) => makeShape("SCALEX", { s, shape }),
    scaleY: (s, shape) => makeShape("SCALEY", { s, shape }),
    padding: (t, r, b, l, shape) => makeShape("PADDING", { t, r, b, l, shape }),
    overlay: (shapes) => makeShape("OVERLAY", { shapes }),
    axes: (config, shape) => makeShape("AXES", { config, shape }),
};

module.exports = { compost, scale };
