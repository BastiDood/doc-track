export interface Icon {
    box: number; 
    name: string;
    svg: string;
}

export enum IconColor {
    Default = "default", 
    Primary = "primary",
    Faded = "faded"
}

export enum IconSize {
    Normal = "1rem",
    Medium = "1.25rem",
    Large = "1.5rem"
}

export enum ButtonType {
    Primary = 'primary',
    Secondary = 'secondary',
    Danger = 'danger'
}