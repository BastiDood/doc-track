import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState';
import { Batch } from '../../../api/batch';

export const earliestBatch = asyncDerived(dashboardState, ($dashboardState) => {
  if ($dashboardState.currentOffice === null){
    return Promise.resolve({})
  }
  return Batch.getEarliestBatch($dashboardState.currentOffice);
  }, 
  { reloadable: true }
);

