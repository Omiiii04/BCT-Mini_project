import { generateKeyPairSync, sign, verify, createHash, createPrivateKey, createPublicKey } from 'node:crypto';

/* Deterministic ECDSA P-256 (prime256v1) wallet using Node crypto. */
export function makeWallet(name) {
  const { publicKey, privateKey } = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
  });

  const pubKeyBuffer = publicKey.export({ type: 'spki', format: 'der' });
  const pubHex = pubKeyBuffer.toString('hex');
  const address = createHash('sha256').update(pubHex).digest('hex').slice(0, 40);
  const formattedAddress = '0x' + address;

  return {
    name,
    address: formattedAddress,
    publicKey: pubHex,               // raw DER public key (hex) — used for address + verification
    privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString('base64'), // PEM private key
    kind: 'ecdsa',
  };
}

/* Sign a payload with a PEM-encoded PKCS8 private key. */
export function signPayload(privateKeyPem, payload) {
  const key = createPrivateKey({ key: privateKeyPem, format: 'pem', type: 'pkcs8' });
  return sign(null, Buffer.from(payload, 'utf8'), key).toString('hex');
}

/* Verify a signature with a raw DER public key (hex). */
export function verifySignature(publicKeyHex, payload, signatureHex) {
  try {
    const key = createPublicKey({
      key: Buffer.from(publicKeyHex, 'hex'),
      format: 'der',
      type: 'spki',
    });
    return verify(null, Buffer.from(payload, 'utf8'), key, Buffer.from(signatureHex, 'hex'));
  } catch (e) {
    return false;
  }
}

/* Deterministic payload a signature covers. */
export function txPayload(tx) {
  return `${tx.sender}|${tx.recipient}|${tx.amount}|${tx.timestamp}`;
}

/* Reconstruct a private KeyObject from a stored PEM (e.g. after DB reload). */
export function privateKeyFromPem(privateKeyPem) {
  return createPrivateKey({ key: privateKeyPem, format: 'pem', type: 'pkcs8' });
}

/* Reconstruct a public KeyObject from stored DER hex. */
export function publicKeyFromHex(publicKeyHex) {
  return createPublicKey({ key: Buffer.from(publicKeyHex, 'hex'), format: 'der', type: 'spki' });
}
