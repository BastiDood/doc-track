export enum MetricsMode {
    User,
    Local,
    Global,
}

export enum IconColor {
    Default = 'default',
    White = 'white'
}

export enum IconSize {
    Normal = 'normal',
    Medium = 'medium',
    Large = 'large',
}

export enum ButtonType {
    Primary = 'primary',
    Secondary = 'secondary',
    Danger = 'danger',
}

export enum ToastType {
    Info = 'info',
    Success = 'success',
    Error = 'error',
    Offline = 'offline'
}

export enum InputType {
    Text = 'text',
    Password = 'password',
    Number = 'number',
}

export enum RowType {
    AcceptDocument,
    Inbox,
    Invite,
    Person,
}

export enum ContainerType {
    Enumeration = 'enumeration',
    Divider = 'divider',
}

export enum Events {
    OnDocumentScan = 'onDocumentScan',
    Done = 'done',
    OverflowClick = 'overflowClick',
    AcceptDocument = 'acceptDocument',
    DeclineDocument = 'declineDocument',
    Camera = 'toggleCamera',
    SendDocument = 'sendDocument',
    TerminateDocument = 'terminateDocument',
    CreateInvitation = 'createInvitation',
    RemoveInvitation = 'removeInvitation',
    RowContainerClick = 'rowContainerClick',
    EditLocalPermission = 'editLocalPermission',
    EditGlobalPermission = 'editGlobalPermission',
    RemoveStaff = 'removeStaff',
    ActivateCategory = 'activateCategory',
    RemoveCategory = 'removeCategory',
    RenameCategory = 'renameCategory',
}
