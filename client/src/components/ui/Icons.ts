import { Icon } from "../types.ts"

export let iconsList: Array<Icon> = [
    {
        box: 32,
        name: "document",
        svg: '<path fill="currentColor" d="m25.7 9.3l-7-7A.908.908 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.908.908 0 0 0-.3-.7ZM18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z"/>'
    },
    {
        box: 32,
        name: "document-arrowdown",
        svg:'<path fill="currentColor" d="m30 25l-1.414-1.414L26 26.172V18h-2v8.172l-2.586-2.586L20 25l5 5l5-5z"/><path fill="currentColor" d="M18 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6v3h2v-5a.91.91 0 0 0-.3-.7l-7-7A.909.909 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h10Zm0-23.6l5.6 5.6H18Z"/>'
    },
    {
        box: 32,
        name: "document-arrowin",
        svg: '<path fill="currentColor" d="M28 19H14.83l2.58-2.59L16 15l-5 5l5 5l1.41-1.41L14.83 21H28v-2z"/><path fill="currentColor" d="M24 14v-4a1 1 0 0 0-.29-.71l-7-7A1 1 0 0 0 16 2H6a2 2 0 0 0-2 2v24a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2h-2v2H6V4h8v6a2 2 0 0 0 2 2h6v2Zm-8-4V4.41L21.59 10Z"/>'
    },
    {
        box: 32,
        name: "document-arrowout",
        svg: '<path fill="currentColor" d="M13 21h13.17l-2.58 2.59L25 25l5-5l-5-5l-1.41 1.41L26.17 19H13v2z"/><path fill="currentColor" d="M22 14v-4a1 1 0 0 0-.29-.71l-7-7A1 1 0 0 0 14 2H4a2 2 0 0 0-2 2v24a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2h-2v2H4V4h8v6a2 2 0 0 0 2 2h6v2Zm-8-4V4.41L19.59 10Z"/>'

    },
    {
        box: 256,
        name: "threedots-vertical",
        svg: '<path fill="currentColor" d="M144 192a16 16 0 1 1-16-16a16 16 0 0 1 16 16ZM128 80a16 16 0 1 0-16-16a16 16 0 0 0 16 16Zm0 32a16 16 0 1 0 16 16a16 16 0 0 0-16-16Z"/>'
    },
    {
        box: 24,
        name: "send-paperplane",
        svg: '<path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8l-8 6l-8.054-2.685z"/>'
    },
    {
        box: 24,
        name: "terminate-box",
        svg: '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 11h10v2H7z"/>'
    }
]