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
    Normal = '1rem',
    Medium = '1.25rem',
    Large = '1.5rem',
}

export enum ButtonType {
    Primary = 'primary',
    Secondary = 'secondary',
<<<<<<< HEAD
    Danger = 'danger',
}

export enum InputType {
    Text = 'text',
    Password = 'password',
    Number = 'number',
}
=======
    Danger = 'danger'
}

export enum RowType {
    Default = "default",
    Inbox = "inbox",
    Outbox = "outbox",
    Person = "person",
    Invite = "invite",
}
>>>>>>> 10b34dc (feat: added RowTypes in types.ts)
