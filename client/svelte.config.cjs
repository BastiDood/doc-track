const sveltePreprocess = require('svelte-preprocess');
const importAssets = require('svelte-preprocess-import-assets');

module.exports = {
    preprocess: [
        sveltePreprocess(),
        importAssets,
    ],
};
