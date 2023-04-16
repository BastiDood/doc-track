const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    [ 'sign', 'verify' ],
);

console.log('=== GENERATED JSON WEB KEYS ===');

const pub = await crypto.subtle.exportKey('jwk', publicKey);
console.log('PublicKey:', pub);

const prv = await crypto.subtle.exportKey('jwk', privateKey);
console.log('PrivateKey', prv);

console.log('=== PUBLIC KEY ===');
console.log(JSON.stringify(pub));

console.log('=== PRIVATE KEY ===');
console.log(JSON.stringify(prv));
