export interface IFileStorage {
  uploadFile(file: Express.Multer.File): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(key: string): Promise<string>;
}