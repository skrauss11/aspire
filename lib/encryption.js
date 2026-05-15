import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import pg from "pg";
import sodium from "libsodium-wrappers";

const VAULT_SECRET_NAME = "aspire_field_encryption_key_v1";
const NONCE_BYTES = 24;
const KEY_BYTES = 32;

let cachedKey = null;
let pgPool = null;

export async function encryptField(value) {
  const plaintext = value == null ? "" : String(value);
  const key = await getEncryptionKey();
  const nonce = crypto.randomBytes(NONCE_BYTES);
  await sodium.ready;
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    null,
    null,
    nonce,
    key
  );
  return Buffer.concat([nonce, Buffer.from(ciphertext)]);
}

export async function decryptField(stored) {
  const buffer = normalizeStoredField(stored);
  if (buffer.length <= NONCE_BYTES) throw new Error("Encrypted field is too short");
  const key = await getEncryptionKey();
  const nonce = buffer.subarray(0, NONCE_BYTES);
  const ciphertext = buffer.subarray(NONCE_BYTES);
  await sodium.ready;
  const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    null,
    nonce,
    key
  );
  return Buffer.from(plaintext).toString("utf8");
}

export async function encryptJson(value) {
  return encryptField(JSON.stringify(value ?? null));
}

export async function decryptJson(stored) {
  const plaintext = await decryptField(stored);
  return JSON.parse(plaintext);
}

export function clearEncryptionKeyCache() {
  cachedKey = null;
}

async function getEncryptionKey() {
  if (cachedKey) return cachedKey;
  const raw = process.env.ASPIRE_FIELD_ENCRYPTION_KEY || await fetchKeyFromVault(VAULT_SECRET_NAME);
  cachedKey = normalizeKey(raw);
  return cachedKey;
}

async function fetchKeyFromVault(secretName) {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error("SUPABASE_DB_URL or ASPIRE_FIELD_ENCRYPTION_KEY is required for field encryption");
  }
  const pool = getPool(connectionString);
  const result = await pool.query(
    "select decrypted_secret from vault.decrypted_secrets where name = $1 limit 1",
    [secretName]
  );
  const secret = result.rows[0]?.decrypted_secret;
  if (!secret) throw new Error(`Vault secret not found: ${secretName}`);
  return secret;
}

function getPool(connectionString) {
  if (!pgPool) {
    pgPool = new pg.Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.SUPABASE_DB_SSL === "disable" ? false : { rejectUnauthorized: false }
    });
  }
  return pgPool;
}

function normalizeStoredField(stored) {
  if (Buffer.isBuffer(stored)) return stored;
  if (stored instanceof Uint8Array) return Buffer.from(stored);
  if (typeof stored === "string") {
    if (stored.startsWith("\\x")) return Buffer.from(stored.slice(2), "hex");
    return Buffer.from(stored, "base64");
  }
  throw new Error("Encrypted field must be a Buffer, Uint8Array, hex bytea string, or base64 string");
}

function normalizeKey(raw) {
  if (!raw) throw new Error("Encryption key is empty");
  const trimmed = String(raw).trim();
  const key = decodeKey(trimmed);
  if (key.length !== KEY_BYTES) {
    throw new Error(`Encryption key must decode to ${KEY_BYTES} bytes`);
  }
  return key;
}

function decodeKey(value) {
  if (/^[a-f0-9]{64}$/i.test(value)) return Buffer.from(value, "hex");
  const base64 = Buffer.from(value, "base64");
  if (base64.length === KEY_BYTES) return base64;
  return Buffer.from(value, "utf8");
}
