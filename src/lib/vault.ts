export interface EncryptedVaultEntry {
  token: string;
  category: string;
  iv: string;
  ciphertext: string;
  createdAt: string;
}

let sessionKey: CryptoKey | null = null;
const encryptedEntries = new Map<string, EncryptedVaultEntry>();
let entrySequence = 0;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function getSessionKey(): Promise<CryptoKey> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is unavailable. Open CipherVault in a secure browser context to run this demo.");
  }
  if (!sessionKey) {
    sessionKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  }
  return sessionKey;
}

export async function encryptSecret(
  token: string,
  value: string,
  category: string,
): Promise<void> {
  const key = await getSessionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(value);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  encryptedEntries.set(`${token}:${++entrySequence}`, {
    token,
    category,
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
    createdAt: new Date().toISOString(),
  });
}

export function getEncryptedEntryCount(): number {
  return encryptedEntries.size;
}

export function clearSessionVault(): void {
  encryptedEntries.clear();
  sessionKey = null;
  entrySequence = 0;
  // JavaScript does not guarantee physical memory zeroization. This only drops app references.
}
