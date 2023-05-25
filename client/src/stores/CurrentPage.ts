import { derived } from '@square/svelte-store';
import { location } from 'svelte-spa-router';

/**
 * This store contains the formatted string name of the page the user currently is.
 */
export const currentPage = derived(location, $location => $location.charAt(1).toUpperCase() + $location.slice(2));
