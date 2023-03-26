export enum IconColor {
    Default = 'default', 
    Primary = 'primary',
    Faded = 'faded',
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

export enum Events {
    OverflowClick = 'overflowClick',
    AcceptDocument = 'acceptDocument',
    DeclineDocument = 'declineDocument',
    Camera = 'toggleCamera',
    SendDocument = 'sendDocument',
    TerminateDocument = 'terminateDocument',
    CreateInvitation = 'createInvitation',
    RemoveInvitation = 'removeInvitation',
    ShowUserInfo = 'showUserInfo',
    DeleteUser = 'deleteUser',
    EditUser = 'editUser',
    ContextClose = 'contextClose',
}

export interface ContextPayload {
    ty: RowType.AcceptDocument | RowType.Inbox;
    id: number;
}

export interface InvitePayload {
    ty: RowType.Invite;
    email: string;
    office: number;
}

export interface PersonPayload {
    ty: RowType.Person;
    id: number;
    office: number;
}

export type RowEvent = ContextPayload | InvitePayload | PersonPayload;
