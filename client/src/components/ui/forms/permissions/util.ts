import { Global, Local } from '../../../../../../model/src/permission.ts';

export function checkPerms(perms: number, mask: Global | Local) {
    const bits = Number(mask);
    return (perms & bits) === bits;
}
