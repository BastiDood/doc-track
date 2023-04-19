import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState';
import { Batch } from '../../../api/batch';

export const earliestBatch = asyncDerived(dashboardState, async ($dashboardState) => {
  if ($dashboardState.currentOffice === null){
    return {}
  }
  return await Batch.getEarliestBatch($dashboardState.currentOffice);
  }, 
  { reloadable: true }
);

