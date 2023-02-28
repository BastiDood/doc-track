import sveltePreprocess from 'svelte-preprocess';
import importAssets from 'svelte-preprocess-import-assets';

export default {
    preprocess: [
        sveltePreprocess(),
        importAssets(),
    ],
};
