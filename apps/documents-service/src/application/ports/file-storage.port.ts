export interface FileStoragePort {
  upload(params: { path: string; file: Buffer }): Promise<void>;
}

export const FILE_STORAGE = Symbol("FILE_STORAGE");