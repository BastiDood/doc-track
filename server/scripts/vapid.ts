import { ApplicationServerKeys } from 'webpush';

const keys = await ApplicationServerKeys.generate();
const { publicKey, privateKey } = await keys.toJSON();

console.log('=== PUBLIC KEY ===');
console.log(publicKey);

console.log('=== PRIVATE KEY ===');
console.log(privateKey);
