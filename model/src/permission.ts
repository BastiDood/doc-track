/** Represents the local permission (admin-level) bit string. */
export enum Local {
    AddStaff = 1,
    RemoveStaff = 2,
    UpdateStaff = 4,
    AddInvite = 8,
    RevokeInvite = 16,
    ViewBatch = 32,
    GenerateBatch = 64,
    InvalidateBatch = 128, // forward-compatibility
    CreateDocument = 256,
    InsertSnapshot = 512,
    ViewMetrics = 1024,
    ViewInbox = 2048,
}

/** Represents the global permission (operator-level) bit string. */
export enum Global {
    GetOffices = 1,
    CreateOffice = 2,
    UpdateOffice = 4,
    UpdateUser = 8,
    CreateCategory = 16,
    UpdateCategory = 32,
    DeleteCategory = 64,
    ActivateCategory = 128,
    ViewMetrics = 256,
}
