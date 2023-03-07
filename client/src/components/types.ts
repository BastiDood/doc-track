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

export enum RowType {
    AcceptDocument,
    Inbox,
    Invite,
    Person
}
export interface RowEvent {
    type: RowType;
    data: Object;
}