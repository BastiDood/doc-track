import { Global, Local } from '../../../../../../model/src/permission.ts';

export function checkAllPerms(perms: number, mask: Global | Local) {
    const bits = Number(mask);
    return (perms & bits) === bits;
}

export function checkAnyPerms(perms: number, mask: Global | Local) {
    const bits = Number(mask);
    return (perms & bits) !== 0;
}