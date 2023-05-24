import { derived } from '@square/svelte-store';
import { location } from 'svelte-spa-router';

export const currentPage = derived(location, $location => $location.charAt(1).toUpperCase() + $location.slice(2));
