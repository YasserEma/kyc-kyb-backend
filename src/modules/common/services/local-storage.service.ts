import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    
    // Handle non-ASCII filenames by using a safe filename
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${this.sanitizeFileName(file.originalname)}`;
    const filePath = path.join(uploadsDir, safeName);
    
    if (file.buffer && file.buffer.length) {
      await fs.promises.writeFile(filePath, file.buffer);
    } else if ((file as any).path) {
      await fs.promises.copyFile((file as any).path, filePath);
    } else {
      throw new Error('No file content available');
    }
    return filePath;
  }

  private sanitizeFileName(originalName: string): string {
    // Remove non-ASCII characters and replace with safe alternatives
    return originalName
      .replace(/[^\w\d.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_')      // Replace multiple underscores with single
      .substring(0, 100);         // Limit filename length
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error: any) {
      // File might not exist, which is fine
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileUrl(filePath: string): Promise<string> {
    // For local storage, we return a relative path that can be served
    // In production, this would be a full URL to your file server/CDN
    const basePath = '/uploads/';
    const fileName = path.basename(filePath);
    return `${basePath}${fileName}`;
  }
}