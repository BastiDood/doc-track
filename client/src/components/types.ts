export interface Icon {
    box: number; 
    name: string;
    svg: string;
}

export enum IconColor {
    Default = "default", 
    Primary = "primary",
    Faded = "faded",
}

export enum IconSize {
    Normal = "20px",
    Medium = "10px",
    Large = "15px",
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
    Default = "default",
    Inbox = "inbox",
    Outbox = "outbox",
    Person = "person",
    Invite = "invite",
}
