import crypto from "crypto";

/**
 * Hashes a plaintext password using PBKDF2 with SHA-512 and a random salt.
 * Returns a single string containing both salt and hash separated by a colon.
 */
export function hashPassword(password) {
  if (!password) throw new Error("Password is required for hashing");
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored hashed password string.
 */
export function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword) return false;
  try {
    const parts = storedPassword.split(":");
    if (parts.length !== 2) return false;
    const [salt, storedHash] = parts;
    const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return computedHash === storedHash;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}
