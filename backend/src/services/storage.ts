import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { config } from '../config';
import { AppError } from '../middleware/error';

/**
 * Storage abstraction. `local` writes to UPLOAD_DIR (development / single-server deploys).
 * For production on ephemeral hosts, add an S3/Supabase-Storage implementation of `StorageProvider`
 * and select it via STORAGE_PROVIDER — controllers only depend on this interface.
 */
export interface StorageProvider {
  save(buffer: Buffer, ext: string): Promise<string>; // returns a public URL
}

type Detected = { ext: 'jpg' | 'png' | 'webp'; mime: string };

/** Detects the real image type from file signature — never trust client MIME/extension. */
export function detectImageType(b: Buffer): Detected | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png', mime: 'image/png' };
  if (b.length > 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP') return { ext: 'webp', mime: 'image/webp' };
  return null;
}

class LocalStorage implements StorageProvider {
  async save(buffer: Buffer, ext: string) {
    const dir = path.resolve(config.storage.uploadDir);
    await fs.mkdir(dir, { recursive: true });
    const name = `${Date.now().toString(36)}-${randomBytes(8).toString('hex')}.${ext}`; // random: no user-controlled filename
    await fs.writeFile(path.join(dir, name), buffer);
    return `${config.storage.publicBaseUrl}/uploads/${name}`;
  }
}

export const storage: StorageProvider = new LocalStorage();

export async function saveImage(buffer: Buffer): Promise<string> {
  if (buffer.length > config.storage.maxFileSizeBytes) throw new AppError('ছবির আকার অনেক বড়', 413);
  const type = detectImageType(buffer);
  if (!type) throw new AppError('শুধু JPG, PNG বা WebP ছবি আপলোড করা যাবে', 415);
  return storage.save(buffer, type.ext);
}
