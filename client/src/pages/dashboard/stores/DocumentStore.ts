import { asyncDerived } from "@square/svelte-store";
import { dashboardState } from "./DashboardState.ts";
import { Document } from "../../../api/document";

const fetchDocuments = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        console.log(currentOffice)
        return currentOffice === null
            ? Promise.resolve(null)
            : Document.getInbox(currentOffice);
    },
    {reloadable: true}
)

export const documentStore = {
    reload: fetchDocuments?.reload,
    subscribe: fetchDocuments.subscribe,
}