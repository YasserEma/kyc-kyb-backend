import * as crypto from 'crypto';
import { DATABASE_CONSTANTS } from '../constants/database.constants';

export class EncryptionHelper {
  private static readonly algorithm = DATABASE_CONSTANTS.ENCRYPTION_ALGORITHM;
  private static readonly ivLength = DATABASE_CONSTANTS.IV_LENGTH;
  private static readonly saltLength = DATABASE_CONSTANTS.SALT_LENGTH;
  private static readonly tagLength = DATABASE_CONSTANTS.TAG_LENGTH;

  /**
   * Encrypts a string using AES-256-GCM
   */
  static encrypt(text: string, secretKey: string): string {
    try {
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);
      
      // Derive key from secret using PBKDF2
      const key = crypto.pbkdf2Sync(secretKey, salt, 100000, 32, 'sha256');
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Combine salt + iv + authTag + encrypted data
      const combined = Buffer.concat([
        salt,
        iv,
        authTag,
        Buffer.from(encrypted, 'hex')
      ]);
      
      return combined.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Decrypts a string encrypted with encrypt method
   */
  static decrypt(encryptedData: string, secretKey: string): string {
    try {
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract components
      const salt = combined.subarray(0, this.saltLength);
      const iv = combined.subarray(this.saltLength, this.saltLength + this.ivLength);
      const authTag = combined.subarray(
        this.saltLength + this.ivLength,
        this.saltLength + this.ivLength + this.tagLength
      );
      const encrypted = combined.subarray(this.saltLength + this.ivLength + this.tagLength);
      
      // Derive key from secret using PBKDF2
      const key = crypto.pbkdf2Sync(secretKey, salt, 100000, 32, 'sha256');
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates a secure random key for encryption
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Hashes a string using SHA-256
   */
  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Compares a plain text with a hash
   */
  static compareHash(text: string, hash: string): boolean {
    const textHash = this.hash(text);
    return crypto.timingSafeEqual(Buffer.from(textHash), Buffer.from(hash));
  }
}