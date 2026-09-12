export interface FileStoragePort {
  upload(params: { path: string; file: Buffer; contentType: string }): Promise<void>;
  getSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
  getSignedUrls(paths: string[], expiresInSeconds?: number): Promise<Record<string, string>>;
  delete(path: string): Promise<void>;
}

export const FILE_STORAGE = Symbol("FILE_STORAGE");