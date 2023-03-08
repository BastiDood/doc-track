export interface Icon {
    box: number; 
    name: string;
    svg: string;
}

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

export interface RowEvent {
    type: RowType;
    data: Object;
}
